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

    postgresdb.tx(t => {
        // creating a sequence of transaction queries:
        const q1 = t.one('INSERT INTO job_posting (employer_id, title, caption, experience_type_id, salary_type_id) VALUES ($1, $2, $3, $4, $4) RETURNING post_id',
                            [jwtPayload.id, body.title, body.caption, body.experienceTypeId, body.salaryTypeId])
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
});

// @route       GET api/postings/listPostings
// @desc        List all job postings from an employer
// @access      Private
router.get('/list', passport.authentication,  (req, res) => {
    var jwtPayload = req.body.jwtPayload;
    if(jwtPayload.userType != 2){
        return res.status(400).json({success:false, error:"Must be an employer to look at postings"})
    }

    postgresdb.any('\
        SELECT title, caption, experience_type_name, salary_type_name, j.post_id, tag_names, tag_ids, new_posts_cnt, posts_cnt, j.created_on \
        FROM job_posting j \
        LEFT JOIN experience_type et ON j.experience_type_id = et.experience_type_id \
        LEFT JOIN salary_type st ON j.salary_type_id = st.salary_type_id \
        LEFT JOIN ( \
            SELECT pt.post_id, array_agg(t.tag_name) as tag_names, array_agg(t.tag_id) as tag_ids \
            FROM posting_tags pt \
            INNER JOIN tags t ON t.tag_id = pt.tag_id \
            GROUP BY post_id \
        ) tg ON tg.post_id = j.post_id \
        LEFT JOIN ( \
            SELECT post_id, SUM(CASE has_seen WHEN false THEN 1 ELSE 0 END) as new_posts_cnt, count(1) as posts_cnt \
            FROM candidate_posting cp \
            GROUP BY post_id \
        ) cd ON cd.post_id = j.post_id \
        WHERE j.employer_id = $1', [jwtPayload.id])
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
});

// @route       GET api/postings/setPostRead/:postId/:candidateId
// @desc        Set posting to be read
// @access      Private
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
        INNER JOIN candidate_posting cp ON jp.post_id = cp.post_id \
        WHERE jp.employer_id = $1 \
        LIMIT 1', [jwtPayload.id])
    .then(d=>{
        if(d.length > 0){
            postgresdb.none('UPDATE candidate_posting SET has_seen=true  WHERE candidate_id = $1 AND post_id = $2', [candidateId, postId])
            .then((data) => {
                res.json({success:true})
            })
            .catch(err => {
                console.log(err)
                res.status(400).json(err)
            });
        }else{
            res.status(400).json({success:false, error:"Mismatched posting"})
        }
    })
    .catch(err => {
        console.log(err)
        res.status(400).json(err)
    });
});

// @route       GET api/postings/listPostingCandidates/:postId
// @desc        List candidates for a job posting
// @access      Private
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
        SELECT c.candidate_id, cp.coins, r.first_name, r.last_name, r.phone_number, rl.email, c.first_name as candidate_first_name, j.created_on as posted_on \
        FROM job_posting j \
        INNER JOIN candidate_posting cp ON cp.post_id = j.post_id \
        INNER JOIN candidate c ON c.candidate_id = cp.candidate_id \
        INNER JOIN recruiter r ON r.recruiter_id = cp.recruiter_id \
        INNER JOIN login rl ON r.recruiter_id = rl.user_id \
        WHERE j.post_id = $1 AND j.employer_id = $2 \
        ORDER BY cp.coins DESC', [postId, jwtPayload.id])
    .then((data) => {
        // Marshal data
        data = data.map(m=>{
            var timestamp = moment(m.posted_on);
            var ms = timestamp.diff(moment());
            m.posted = moment.duration(ms).humanize() + " ago";
            m.posted_on = timestamp.format("x");
            return m
        })
        res.json(data)
    })
    .catch(err => {
        console.log(err)
        res.status(400).json(err)
    });
});

module.exports = router;