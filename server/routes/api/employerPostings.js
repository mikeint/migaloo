const express = require('express');
const router = express.Router();
const passport = require('../../config/passport');
const validatePostingsInput = require('../../validation/postings');  
const moment = require('moment');

const db = require('../../config/db')
const postgresdb = db.postgresdb
const pgp = db.pgp
const postingTagsInsertHelper = new pgp.helpers.ColumnSet(['post_id', 'tag_id'], {table: 'posting_tags'});


/**
 * Create a new job posting for the employer
 * @route POST api/postings/create
 * @group postings - Job postings for employers
 * @param {Object} body.optional
 * @returns {object} 200 - Success Message
 * @returns {Error}  default - Unexpected error
 * @access Private
 */
router.post('/create', passport.authentication,  (req, res) => {

    /**
     * Inputs Body:
     * title
     * caption
     * employer
     * salaryTypeId (Optional)
     * experienceTypeId (Optional)
     * tagIds (Optional)
     */
    var body = req.body
    const { errors, isValid } = validatePostingsInput(body);
    //check Validation
    if(!isValid) {
        return res.status(400).json(errors);
    }
    var jwtPayload = body.jwtPayload;
    if(jwtPayload.userType != 2){
        return res.status(400).json({success:false, error:"Must be an employer to add a posting"})
    }

    postgresdb.one('SELECT employer_id \
            FROM employer_contact ec \
            INNER JOIN account_manager ac ON ac.account_manager_id = ec.employer_contact_id \
            WHERE ec.employer_contact_id = $1 AND ac.active AND employer_id = $2', [jwtPayload.id, body.employer]).then(()=>{
        postgresdb.tx(t => {
            // creating a sequence of transaction queries:
            const q1 = t.one('INSERT INTO job_posting (employer_id, title, caption, experience_type_id, salary_type_id) VALUES ($1, $2, $3, $4, $5) RETURNING post_id',
                                [body.employer, body.title, body.caption, body.experience, body.salary])
            return q1.then((post_ret)=>{
                if(body.tagIds != null && body.tagIds.length > 0){
                    const query = pgp.helpers.insert(body.tagIds.map(d=>{return {post_id: post_ret.post_id, tag_id: d}}), postingTagsInsertHelper);
                    const q2 = t.none(query);
                    return q2
                        .then(() => {
                            res.status(200).json({success: true})
                            return []
                        })
                        .catch(err => {
                            console.log(err)
                            res.status(400).json({success: false, error:err})
                        });
                }else{
                    res.status(200).json({success: true})
                    return []
                }
            })
            .catch(err => {
                
                console.log(err)
                res.status(400).json({success: false, error:err})
            });
        })
        .then(() => {
            console.log("Done TX")
        }).catch((err)=>{
            console.log(err)
            return res.status(500).json({success: false, error:err})
        });
    }).catch((err)=>{
        console.log(err)
        return res.status(500).json({success: false, error:err})
    });
});

/**
 * List all job postings from an employer
 * @route POST api/postings/list
 * @group postings - Job postings for employers
 * @param {Object} body.optional
 * @returns {object} 200 - Success Message
 * @returns {Error}  default - Unexpected error
 * @access Private
 */
router.get('/list', passport.authentication, postListing);
router.get('/list/:page', passport.authentication, postListing);
function postListing(req, res){
    var page = req.params.page;
    console.log(req.query)
    if(page == null)
        page = 1;
    var jwtPayload = req.body.jwtPayload;
    if(jwtPayload.userType != 2){
        return res.status(400).json({success:false, error:"Must be an employer to look at postings"})
    }
    // Define the filters
    const filters = {
        'employer':'AND j.employer_id in (${employer:csv})',
        'contactType':'AND ec.is_primary in (${contactType:csv})'
    }
    const validKeys = Object.keys(filters).filter(d=>Object.keys(req.query).includes(d))
    const paramsToAdd = {};
    validKeys.forEach(k=>{
        const v = JSON.parse(req.query[k])
        if(v.length > 0)
            paramsToAdd[k] = v
    })
    const filtersToAdd = Object.keys(paramsToAdd).map(k=>filters[k]).join(" ")
    
    postgresdb.any('\
        SELECT j.post_id, title, caption, experience_type_name, salary_type_name, tag_names, tag_ids, new_posts_cnt, \
            posts_cnt, j.created_on, (count(1) OVER())/10+1 AS page_count \
        FROM job_posting j \
        INNER JOIN employer_contact ec ON j.employer_id = ec.employer_id \
        LEFT JOIN experience_type et ON j.experience_type_id = et.experience_type_id \
        LEFT JOIN salary_type st ON j.salary_type_id = st.salary_type_id \
        LEFT JOIN ( \
            SELECT pt.post_id, array_agg(t.tag_name) as tag_names, array_agg(t.tag_id) as tag_ids \
            FROM posting_tags pt \
            INNER JOIN tags t ON t.tag_id = pt.tag_id \
            GROUP BY post_id \
        ) tg ON tg.post_id = j.post_id \
        LEFT JOIN ( \
            SELECT post_id, SUM(CASE has_seen_post WHEN false THEN 1 ELSE 0 END) as new_posts_cnt, count(1) as posts_cnt \
            FROM candidate_posting cp \
            GROUP BY post_id \
        ) cd ON cd.post_id = j.post_id \
        WHERE ec.employer_contact_id = ${contactId} AND j.active '+filtersToAdd+'\
        ORDER BY j.created_on DESC \
        OFFSET ${page} \
        LIMIT 10', {contactId:jwtPayload.id, page:(page-1)*10, ...paramsToAdd})
    .then((data) => {
        // Marshal data
        data = data.map(m=>{
            var timestamp = moment(m.created_on)
            var ms = timestamp.diff(moment());
            m.created = moment.duration(ms).humanize() + " ago";
            m.created_on = timestamp.format("x");
            return m
        })
        res.json(data)
    })
    .catch(err => {
        console.log(err)
        res.status(400).json(err)
    });
}

/**
 * Set posting to be considered read
 * @route POST api/postings/setRead/:postId/:candidateId
 * @group postings - Job postings for employers
 * @param {Object} body.optional
 * @returns {object} 200 - Success Message
 * @returns {Error}  default - Unexpected error
 * @access Private
 */
router.post('/setRead/:postId/:candidateId', passport.authentication,  (req, res) => {
    var jwtPayload = req.body.jwtPayload;
    var postId = req.params.postId
    var candidateId = req.params.candidateId
    if(jwtPayload.userType != 2){
        return res.status(400).json({success:false, error:"Must be an employer to look at postings"})
    }
    if(postId == null){
        return res.status(400).json({success:false, error:"Missing Post Id"})
    }
    if(candidateId == null){
        return res.status(400).json({success:false, error:"Missing Candidate Id"})
    }
    postgresdb.any('\
        SELECT 1 \
        FROM job_posting jp \
        INNER JOIN employer_contact ec ON jp.employer_id = ec.employer_id \
        WHERE ec.employer_contact_id = $1 AND jp.active \
        LIMIT 1', [jwtPayload.id])
    .then(()=>{
        postgresdb.none('UPDATE candidate_posting SET has_seen_post=true  WHERE candidate_id = $1 AND post_id = $2', [candidateId, postId])
        .then((data) => {
            res.json({success:true})
        })
        .catch(err => {
            console.log(err)
            res.status(400).json(err)
        });
    })
    .catch(err => {
        console.log(err)
        res.status(400).json(err)
    });
});
/**
 * Set posting to be considered accepted or not accepted by the account manager
 * @route POST api/postings/setAcceptedPhase1/:postId/:candidateId/:recruiterId
 * @group postings - Job postings for employers
 * @param {Object} body.optional
 * @returns {object} 200 - Success Message
 * @returns {Error}  default - Unexpected error
 * @access Private
 */
router.post('/setAccepted/migaloo/:postId/:candidateId/:recruiterId', passport.authentication,  (req, res) => {
    var jwtPayload = req.body.jwtPayload;
    var postId = req.params.postId;
    var candidateId = req.params.candidateId;
    var recruiterId = req.params.recruiterId;
    var accepted = req.body.accepted
    if(jwtPayload.userType != 2){
        return res.status(400).json({success:false, error:"Must be an employer to look at postings"})
    }
    if(postId == null){
        return res.status(400).json({success:false, error:"Missing Post Id"})
    }
    if(candidateId == null){
        return res.status(400).json({success:false, error:"Missing Candidate Id"})
    }
    if(recruiterId == null){
        return res.status(400).json({success:false, error:"Missing Recruiter Id"})
    }
    recruiterId = parseInt(recruiterId, 10);
    postgresdb.one('\
        SELECT jp.employer_id \
        FROM job_posting jp \
        INNER JOIN employer_contact ec ON jp.employer_id = ec.employer_id \
        WHERE ec.employer_contact_id = $1 AND jp.active AND jp.post_id = $2 \
        LIMIT 1', [jwtPayload.id, postId])
    .then(()=>{
        postgresdb.none('UPDATE candidate_posting SET migaloo_accepted=$1, has_seen_response=NULL, migaloo_responded_on=NOW()\
            WHERE candidate_id = $2 AND post_id = $3 AND recruiter_id = $4', [accepted, candidateId, postId, recruiterId])
        .then((data) => {
            if(accepted){
                var userId1, userId2;
                if(recruiterId < d.employerId){
                    userId1 = recruiterId;
                    userId2 = d.employerId;
                }else{
                    userId1 = d.employerId;
                    userId2 = recruiterId;
                }
                postgresdb.none('INSERT INTO messages_subject(user_id_1, user_id_2, subject_user_id, post_id) VALUES \
                        ($1, $2, $3, $4)', [userId1, userId2, candidateId, postId])
                .then((data) => {
                    res.json({success:true})
                })
                .catch(err => {
                    console.log(err)
                    res.json({success:true}) // If this subject was already created just skip the error
                });
            }else
                res.json({success:true})
        })
        .catch(err => {
            console.log(err)
            res.status(400).json(err)
        });
    })
    .catch(err => {
        console.log(err)
        res.status(400).json(err)
    });
});
/**
 * Set posting to be considered accepted or not accepted by the employer
 * @route POST api/postings/setAcceptedState/:postId/:candidateId/:recruiterId
 * @group postings - Job postings for employers
 * @param {Object} body.optional
 * @returns {object} 200 - Success Message
 * @returns {Error}  default - Unexpected error
 * @access Private
 */
router.post('/setAccepted/employer/:postId/:candidateId/:recruiterId', passport.authentication,  (req, res) => {
    var jwtPayload = req.body.jwtPayload;
    var postId = req.params.postId;
    var candidateId = req.params.candidateId;
    var recruiterId = req.params.recruiterId;
    var accepted = req.body.accepted
    var denialReasonId = req.body.denialReasonId;
    if(jwtPayload.userType != 2){
        return res.status(400).json({success:false, error:"Must be an employer to look at postings"})
    }
    if(postId == null){
        return res.status(400).json({success:false, error:"Missing Post Id"})
    }
    if(candidateId == null){
        return res.status(400).json({success:false, error:"Missing Candidate Id"})
    }
    if(recruiterId == null){
        return res.status(400).json({success:false, error:"Missing Recruiter Id"})
    }
    if(denialReasonId == null)
        denialReasonId = null;
    recruiterId = parseInt(recruiterId, 10);
    postgresdb.one('\
        SELECT jp.employer_id \
        FROM job_posting jp \
        INNER JOIN employer_contact ec ON jp.employer_id = ec.employer_id \
        WHERE ec.employer_contact_id = $1 AND jp.active AND jp.post_id = $2 \
        LIMIT 1', [jwtPayload.id, postId])
    .then(()=>{
        postgresdb.none('UPDATE candidate_posting SET employer_accepted=$1, denial_reason_id=$2, employer_responded_on=NOW()\
            WHERE candidate_id = $3 AND post_id = $4 AND recruiter_id = $5', [accepted, denialReasonId, candidateId, postId, recruiterId])
        .then((data) => {
            res.json({success:true})
        })
        .catch(err => {
            console.log(err)
            res.status(400).json(err)
        });
    })
    .catch(err => {
        console.log(err)
        res.status(400).json(err)
    });
});
/**
 * Set posting to be considered accepted or not accepted by the job
 * @route POST api/postings/setAcceptedState/:postId/:candidateId/:recruiterId
 * @group postings - Job postings for employers
 * @param {Object} body.optional
 * @returns {object} 200 - Success Message
 * @returns {Error}  default - Unexpected error
 * @access Private
 */
router.post('/setAccepted/job/:postId/:candidateId/:recruiterId', passport.authentication,  (req, res) => {
    var jwtPayload = req.body.jwtPayload;
    var postId = req.params.postId;
    var candidateId = req.params.candidateId;
    var recruiterId = req.params.recruiterId;
    var accepted = req.body.accepted;
    var denialReasonId = req.body.denialReasonId;
    if(jwtPayload.userType != 2){
        return res.status(400).json({success:false, error:"Must be an employer to look at postings"})
    }
    if(postId == null){
        return res.status(400).json({success:false, error:"Missing Post Id"})
    }
    if(candidateId == null){
        return res.status(400).json({success:false, error:"Missing Candidate Id"})
    }
    if(recruiterId == null){
        return res.status(400).json({success:false, error:"Missing Recruiter Id"})
    }
    if(denialReasonId == null)
        denialReasonId = null;
    recruiterId = parseInt(recruiterId, 10);
    postgresdb.one('\
        SELECT jp.employer_id \
        FROM job_posting jp \
        INNER JOIN employer_contact ec ON jp.employer_id = ec.employer_id \
        WHERE ec.employer_contact_id = $1 AND jp.active AND jp.post_id = $2 \
        LIMIT 1', [jwtPayload.id, postId])
    .then(()=>{
        postgresdb.none('UPDATE candidate_posting SET job_accepted=$1, denial_reason_id=$2, job_responded_on=NOW()\
            WHERE candidate_id = $4 AND post_id = $5 AND recruiter_id = $6', [accepted, denialReasonId, candidateId, postId, recruiterId])
        .then((data) => {
            res.json({success:true})
        })
        .catch(err => {
            console.log(err)
            res.status(400).json(err)
        });
    })
    .catch(err => {
        console.log(err)
        res.status(400).json(err)
    });
});
/**
 * Set posting to be hidden
 * @route POST api/postings/hide
 * @group postings - Job postings for employers
 * @param {Object} body.optional
 * @returns {object} 200 - Success Message
 * @returns {Error}  default - Unexpected error
 * @access Private
 */
router.post('/hide', passport.authentication,  (req, res) => {
    var jwtPayload = req.body.jwtPayload;
    var postId = req.body.postId
    if(jwtPayload.userType != 2){
        return res.status(400).json({success:false, error:"Must be an employer to look at postings"})
    }
    if(postId == null){
        return res.status(400).json({success:false, error:"Missing Post Id"})
    }
    postgresdb.one('\
        SELECT jp.employer_id \
        FROM job_posting jp \
        INNER JOIN employer_contact ec ON jp.employer_id = ec.employer_id \
        WHERE ec.employer_contact_id = $1 AND jp.active AND jp.post_id = $2 \
        LIMIT 1', [jwtPayload.id, postId])
    .then(()=>{
        // TODO: Return all coins that have not been accepted or rejected
        postgresdb.none('UPDATE job_posting SET is_valid=false WHERE post_id = $1', [postId])
        .then((data) => {
            res.json({success:true})
        })
        .catch(err => {
            console.log(err)
            res.status(400).json(err)
        });
    })
    .catch(err => {
        console.log(err)
        res.status(400).json(err)
    });
});
/**
 * Set posting to be removed
 * @route POST api/postings/remove
 * @group postings - Job postings for employers
 * @param {Object} body.optional
 * @returns {object} 200 - Success Message
 * @returns {Error}  default - Unexpected error
 * @access Private
 */
router.post('/remove', passport.authentication,  (req, res) => {
    var jwtPayload = req.body.jwtPayload;
    var postId = req.body.postId
    if(jwtPayload.userType != 2){
        return res.status(400).json({success:false, error:"Must be an employer to look at postings"})
    }
    if(postId == null){
        return res.status(400).json({success:false, error:"Missing Post Id"})
    }
    postgresdb.one('\
        SELECT jp.employer_id \
        FROM job_posting jp \
        INNER JOIN employer_contact ec ON jp.employer_id = ec.employer_id \
        WHERE ec.employer_contact_id = $1 AND jp.active AND jp.post_id = $2 \
        LIMIT 1', [jwtPayload.id, postId])
    .then(()=>{
        // TODO: Return all coins that have not been accepted or rejected
        postgresdb.none('UPDATE job_posting SET active=false WHERE post_id = $1', [postId])
        .then((data) => {
            res.json({success:true})
        })
        .catch(err => {
            console.log(err)
            res.status(400).json(err)
        });
    })
    .catch(err => {
        console.log(err)
        res.status(400).json(err)
    });
});

/**
 * List candidates for a job posting
 * @route POST api/postings/listCandidates/:postId
 * @group postings - Job postings for employers
 * @param {Object} body.optional
 * @returns {object} 200 - Success Message
 * @returns {Error}  default - Unexpected error
 * @access Private
 */
router.get('/listCandidates/:postId', passport.authentication,  (req, res) => {
    var jwtPayload = req.body.jwtPayload;
    var postId = req.params.postId
    if(jwtPayload.userType != 2){
        return res.status(400).json({success:false, error:"Must be an employer to look at postings"})
    }
    if(postId == null){
        return res.status(400).json({success:false, error:"Missing postId"})
    }

    postgresdb.any(' \
        SELECT c.candidate_id, r.first_name, r.last_name, r.phone_number, r.recruiter_id, rl.email, cp.migaloo_accepted, cp.employer_accepted,\
            cp.job_accepted, cp.has_seen_post, c.first_name as candidate_first_name, j.created_on as posted_on, c.resume_id \
        FROM job_posting j \
        INNER JOIN employer_contact ec ON j.employer_id = ec.employer_id \
        INNER JOIN candidate_posting cp ON cp.post_id = j.post_id \
        INNER JOIN candidate c ON c.candidate_id = cp.candidate_id \
        INNER JOIN recruiter r ON r.recruiter_id = cp.recruiter_id \
        INNER JOIN login rl ON r.recruiter_id = rl.user_id \
        WHERE j.post_id = $1 AND ec.employer_contact_id = $2 AND j.active \
        ORDER BY cp.created_on DESC', [postId, jwtPayload.id])
    .then((data) => {
        // Marshal data
        data = data.map(m=>{
            var timestamp = moment(m.posted_on);
            var ms = timestamp.diff(moment());
            m.posted = moment.duration(ms).humanize() + " ago";
            m.posted_on = timestamp.format("x");
            return m
        })
        res.json({success:true, candidateList:data})
    })
    .catch(err => {
        console.log(err)
        res.status(400).json(err)
    });
});

module.exports = router;