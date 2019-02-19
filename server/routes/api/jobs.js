const express = require('express');
const router = express.Router();
const passport = require('../../config/passport');
const moment = require('moment');
const validateCandidatePosting = require('../../validation/jobs');  

const postgresdb = require('../../config/db').postgresdb


function getJobs(req, res){
    var page = req.params.page;
    if(page == null)
        page = 1;
    var jwtPayload = req.body.jwtPayload;
    if(jwtPayload.userType != 1){
        return res.status(400).json({success:false, error:"Must be a recruiter to look for postings"})
    }
    postgresdb.any('\
        SELECT title, caption, experience_type_name, company_name, image_id, \
            street_address_1, street_address_2, city, state, country, tag_ids, tag_names, j.created_on as posted_on \
        FROM job_posting j \
        LEFT JOIN experience_type et ON j.experience_type_id = et.experience_type_id \
        INNER JOIN employer e ON j.employer_id = e.employer_id \
        LEFT JOIN address a ON a.address_id = e.address_id \
        LEFT JOIN ( \
            SELECT pt.post_id, array_agg(t.tag_name) as tag_names, array_agg(t.tag_id) as tag_ids \
            FROM posting_tags pt \
            INNER JOIN tags t ON t.tag_id = pt.tag_id \
            GROUP BY post_id \
        ) tg ON tg.post_id = j.post_id \
        OFFSET $1 LIMIT 10', [(page-1)*10])
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
}
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

/**
 * List job postings that match candidates
 * @route GET api/jobs/listJobsForCandidate/:candidateId
 * @group jobs - Jobs for Recruiters
 * @returns {object} 200 - A list of maps containing jobs
 * @returns {Error}  default - Unexpected error
 * @access Private
 */
router.get('/listForCandidate/:candidateId', passport.authentication,  (req, res) => {
    var candidateId = req.params.candidateId
    if(candidateId == null)
        return res.status(400).json({success:false, error:"Missing Candidate Id"})
    
    var jwtPayload = req.body.jwtPayload;
    if(jwtPayload.userType != 1){
        return res.status(400).json({success:false, error:"Must be a recruiter to look for postings"})
    }
    postgresdb.any('\
        SELECT title, caption, experience_type_name, company_name, image_id, \
            street_address_1, street_address_2, city, state, country, tag_ids, tag_names, tag_score, j.created_on as posted_on \
        FROM job_posting j \
        LEFT JOIN ( \
            SELECT post_id, cast(COUNT(1) as decimal)/( \
                SELECT MAX(c) \
                FROM ( \
                    SELECT COUNT(1) as c \
                    FROM candidate_tags ct \
                    INNER JOIN posting_tags pt ON pt.tag_id = ct.tag_id \
                    WHERE candidate_id = $1 \
                    GROUP BY post_id \
                ) mt \
            ) as tag_score \
            FROM candidate_tags ct \
            INNER JOIN posting_tags pt ON pt.tag_id = ct.tag_id \
            WHERE candidate_id = $2 \
            GROUP BY post_id \
        ) jc ON jc.post_id = j.post_id \
        LEFT JOIN experience_type et ON j.experience_type_id = et.experience_type_id \
        INNER JOIN employer e ON j.employer_id = e.employer_id \
        LEFT JOIN address a ON a.address_id = e.address_id \
        LEFT JOIN ( \
            SELECT pt.post_id, array_agg(t.tag_name) as tag_names, array_agg(t.tag_id) as tag_ids \
            FROM posting_tags pt \
            INNER JOIN tags t ON t.tag_id = pt.tag_id \
            GROUP BY post_id \
        ) tg ON tg.post_id = j.post_id \
        ORDER BY tag_score DESC', [candidateId, candidateId])
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