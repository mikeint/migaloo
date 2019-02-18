const express = require('express');
const router = express.Router();
const passport = require('../../config/passport');

const postgresdb = require('../../config/db').postgresdb

router.get('/listPostings', passport.authentication,  (req, res) => {
    var jwtPayload = req.body.jwtPayload;
    if(jwtPayload.userType != 2){
        return res.status(400).json({success:false, error:"Must be an employer to look at postings"})
    }

    postgresdb.any('\
        SELECT title, caption, experience_type_name, j.post_id, tag_names, tag_ids \
        FROM job_posting j \
        LEFT JOIN experience_type et ON j.experience_type_id = et.experience_type_id \
        LEFT JOIN ( \
            SELECT pt.post_id, array_agg(t.tag_name) as tag_names, array_agg(t.tag_id) as tag_ids \
            FROM posting_tags pt \
            INNER JOIN tags t ON t.tag_id = pt.tag_id \
            GROUP BY post_id \
        ) tg ON tg.post_id = j.post_id \
        WHERE j.employer_id = $1', [jwtPayload.id])
    .then((data) => {
        res.json(data)
    })
    .catch(err => {
        console.log(err)
        res.status(400).json(err)
    });
});

router.get('/listPostingCandidates/:postId', passport.authentication,  (req, res) => {
    var jwtPayload = req.body.jwtPayload;
    var postId = req.params.postId
    if(jwtPayload.userType != 2){
        return res.status(400).json({success:false, error:"Must be an employer to look at postings"})
    }
    if(postId == null){
        return res.status(400).json({success:false, error:"Missing postId"})
    }

    postgresdb.any(' \
        SELECT cp.coins, r.first_name, r.last_name, r.phone_number, rl.email, c.first_name as candidate_first_name \
        FROM job_posting j \
        INNER JOIN candidate_posting cp ON cp.post_id = j.post_id \
        INNER JOIN candidate c ON c.candidate_id = cp.candidate_id \
        INNER JOIN recruiter r ON r.recruiter_id = cp.recruiter_id \
        INNER JOIN login rl ON r.recruiter_id = rl.user_id \
        WHERE j.post_id = $1 AND j.employer_id = $2 \
        ORDER BY cp.coins DESC', [postId, jwtPayload.id])
    .then((data) => {
        res.json(data)
    })
    .catch(err => {
        console.log(err)
        res.status(400).json(err)
    });
});

module.exports = router;