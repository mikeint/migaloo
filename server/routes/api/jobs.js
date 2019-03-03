const express = require('express');
const router = express.Router();
const passport = require('../../config/passport');
const moment = require('moment');
const validateCandidatePosting = require('../../validation/jobs');  

const postgresdb = require('../../config/db').postgresdb


/**
 * List all available job postings
 * @route GET api/jobs/listJobs
 * @group jobs - Jobs for Recruiters
 * @returns {object} 200 - A list of maps containing jobs
 * @returns {Error}  default - Unexpected error
 * @access Private
 */
router.get('/list', passport.authentication, getJobs);
router.get('/list/:page', passport.authentication, getJobs);
function getJobs(req, res){
    var page = req.params.page;
    if(page == null)
        page = 1;
    var jwtPayload = req.body.jwtPayload;
    if(jwtPayload.userType != 1){
        return res.status(400).json({success:false, error:"Must be a recruiter to look for postings"})
    }
    postgresdb.any('\
        SELECT j.employer_id, j.post_id, title, caption, experience_type_name, salary_type_name, company_name, image_id, \
            street_address_1, street_address_2, city, state, country, tag_ids, \
            tag_names, j.created_on as posted_on, (count(1) OVER())/10+1 AS page_count \
        FROM job_posting j \
        LEFT JOIN experience_type et ON j.experience_type_id = et.experience_type_id \
        LEFT JOIN salary_type st ON j.salary_type_id = st.salary_type_id \
        INNER JOIN employer e ON j.employer_id = e.employer_id \
        LEFT JOIN address a ON a.address_id = e.address_id \
        LEFT JOIN ( \
            SELECT pt.post_id, array_agg(t.tag_name) as tag_names, array_agg(t.tag_id) as tag_ids \
            FROM posting_tags pt \
            INNER JOIN tags t ON t.tag_id = pt.tag_id \
            GROUP BY post_id \
        ) tg ON tg.post_id = j.post_id \
        ORDER BY j.created_on DESC \
        OFFSET $1 \
        LIMIT 10', [(page-1)*10])
    .then((data) => {
        // Marshal data
        data = data.map(m=>{
            var timestamp = moment(m.posted_on);
            var ms = timestamp.diff(moment());
            m.posted = moment.duration(ms).humanize() + " ago";
            m.posted_on = timestamp.format("x");
            return m
        })
        res.json({jobList:data, success:true})
    })
    .catch(err => {
        console.log(err)
        res.status(400).json(err)
    });
}

/**
 * List job postings that match candidates
 * @route GET api/jobs/listForCandidate/:candidateId
 * @group jobs - Jobs for Recruiters
 * @returns {object} 200 - A list of maps containing jobs
 * @returns {Error}  default - Unexpected error
 * @access Private
 */
router.get('/listForCandidate/:candidateId', passport.authentication,  getJobsForCandidate);
router.get('/listForCandidate/:candidateId/:page', passport.authentication,  getJobsForCandidate);
function getJobsForCandidate(req, res){
    var page = req.params.page;
    if(page == null)
        page = 1;
    var candidateId = req.params.candidateId
    if(candidateId == null)
        return res.status(400).json({success:false, error:"Missing Candidate Id"})
    
    var jwtPayload = req.body.jwtPayload;
    if(jwtPayload.userType != 1){
        return res.status(400).json({success:false, error:"Must be a recruiter to look for postings"})
    }
    postgresdb.task(t => {
        return t.one('SELECT first_name, last_name \
            FROM recruiter_candidate rc \
            INNER JOIN candidate c ON c.candidate_id = rc.candidate_id \
            WHERE rc.recruiter_id = $1 AND c.candidate_id = $2', [jwtPayload.id, candidateId])
        .then(candidate_data=>{
            return t.any('\
                SELECT j.post_id, title, caption, experience_type_name, salary_type_name, company_name, image_id, j.employer_id, \
                    street_address_1, street_address_2, city, state, country, tag_ids, tag_names, \
                    score, total_score, score/total_score*100.0 as tag_score, j.created_on as posted_on, (count(1) OVER())/10+1 AS page_count \
                FROM job_posting j \
                LEFT JOIN experience_type et ON j.experience_type_id = et.experience_type_id \
                LEFT JOIN salary_type st ON j.salary_type_id = st.salary_type_id \
                INNER JOIN employer e ON j.employer_id = e.employer_id \
                LEFT JOIN address a ON a.address_id = e.address_id \
                LEFT JOIN ( \
                    SELECT pt.post_id, array_agg(t.tag_name) as tag_names, array_agg(t.tag_id) as tag_ids \
                    FROM posting_tags pt \
                    INNER JOIN tags t ON t.tag_id = pt.tag_id \
                    GROUP BY post_id \
                ) tg ON tg.post_id = j.post_id \
                \
                INNER JOIN ( \
                    SELECT j.post_id, (COUNT(1) + \
                        count(distinct CASE WHEN ci.experience_type_id = j.experience_type_id THEN ci.experience_type_id ELSE null END) + \
                        greatest(5-abs(least(max(j.salary_type_id - ci.salary_type_id), 0)), 0)/5.0) as score, \
                        ( \
                            SELECT COUNT(1)+count(distinct ci.experience_type_id)+count(distinct ci.salary_type_id) \
                            FROM candidate_tags cti \
                            INNER JOIN candidate ci ON ci.candidate_id = cti.candidate_id \
                            WHERE cti.candidate_id = $1 \
                        ) as total_score \
                    FROM candidate_tags ct \
                    INNER JOIN posting_tags pt ON pt.tag_id = ct.tag_id \
                    INNER JOIN job_posting j ON j.post_id = pt.post_id \
                    INNER JOIN candidate ci ON ci.candidate_id = ct.candidate_id \
                    WHERE ci.candidate_id = $1 \
                    GROUP BY j.post_id \
                ) jc ON jc.post_id = j.post_id \
                ORDER BY tag_score DESC, j.created_on DESC \
                OFFSET $2 \
                LIMIT 10', [candidateId, (page-1)*10])
                
                // WHERE NOT EXISTS (SELECT 1 FROM candidate_posting cp WHERE cp.candidate_id = $1) \
            .then((data) => {
                // Marshal data
                data = data.map(m=>{
                    var timestamp = moment(m.posted_on);
                    var ms = timestamp.diff(moment());
                    m.posted = moment.duration(ms).humanize() + " ago";
                    m.posted_on = timestamp.format("x");
                    return m
                })
                res.json({jobList:data, candidate:candidate_data, success:true})
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
    })
    .then((data) => {
        // Done task
    })
    .catch(err => {
        console.log(err)
        res.status(400).json(err)
    });
}

/**
 * Post candidate to job
 * @route POST api/jobs/postCandidate
 * @group jobs - Jobs for Recruiters
 * @params {number} body.candidateId - Candidate Id
 * @params {number} body.postId - Id of the job post
 * @params {number} body.coins - Number of coins
 * @returns {object} 200 - A success message
 * @returns {Error}  default - Unexpected error
 * @access Private
 */
router.post('/postCandidate', passport.authentication,  (req, res) => {
    var body = req.body
    const { errors, isValid } = validateCandidatePosting(body);
    //check Validation
    if(!isValid) {
        return res.status(400).json(errors);
    }
    var jwtPayload = req.body.jwtPayload;
    if(jwtPayload.userType != 1){
        return res.status(400).json({success:false, error:"Must be a recruiter to look for postings"})
    }

    postgresdb.tx(t => {
        // Will fail if not their candidate
        const q1 = t.one('SELECT 1 FROM recruiter_candidate WHERE candidate_id = $1 AND recruiter_id = $2',
                            [body.candidateId, jwtPayload.id])

        const q2 = t.none('INSERT INTO candidate_posting (candidate_id, post_id, recruiter_id, coins) VALUES ($1, $2, $3, $4)',
                            [body.candidateId, body.postId, jwtPayload.id, body.coins])

        const q3 = t.one('UPDATE recruiter SET coins = coins - $1 WHERE recruiter_id = $2 RETURNING coins',
                            [body.coins, jwtPayload.id])
        return t.batch([q1, q2, q3])
        .then((d)=>{
            console.log("Posted candidate for "+body.coins+" coins")
            res.json({success: true, coinsLeft:d[2].coins})
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

module.exports = router;