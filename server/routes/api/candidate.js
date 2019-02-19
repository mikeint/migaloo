const express = require('express');
const router = express.Router();
const passport = require('../../config/passport');
const moment = require('moment');

const db = require('../../config/db')
const postgresdb = db.postgresdb
const pgp = db.pgp


/**
 * Create a new canidate for the recruiter
 * @route POST api/canidate/create
 * @group canidate - Job postings for employers
 * @param {Object} body.optional
 * @returns {object} 200 - Success Message
 * @returns {Error}  default - Unexpected error
 * @access Private
 */
router.post('/create', passport.authentication,  (req, res) => {

    // /**
    //  * Inputs Body:
    //  * title
    //  * caption
    //  * salaryTypeId (Optional)
    //  * experienceTypeId (Optional)
    //  * tagIds (Optional)
    //  */
    // var body = req.body
    // const { errors, isValid } = validatePostingsInput(body);
    // //check Validation
    // if(!isValid) {
    //     return res.status(400).json(errors);
    // }
    // var jwtPayload = body.jwtPayload;
    // if(jwtPayload.userType != 2){
    //     return res.status(400).json({success:false, error:"Must be an employer to add a posting"})
    // }

    // postgresdb.tx(t => {
    //     // creating a sequence of transaction queries:
    //     const q1 = t.one('INSERT INTO job_posting (employer_id, title, caption, experience_type_id, salary_type_id) VALUES ($1, $2, $3, $4, $5) RETURNING post_id',
    //                         [jwtPayload.id, body.title, body.caption, body.experienceTypeId, body.salaryTypeId])
    //     return q1.then((post_ret)=>{
    //         if(body.tagIds != null && body.tagIds.length > 0){
    //             const query = pgp.helpers.insert(body.tagIds.map(d=>{return {post_id: post_ret.post_id, tag_id: d}}), postingTagsInsertHelper);
    //             const q2 = t.none(query);
    //             return q2
    //                 .then(() => {
    //                     res.status(200).json({success: true})
    //                     return []
    //                 })
    //                 .catch(err => {
    //                     console.log(err)
    //                     res.status(400).json({success: false, error:err})
    //                 });
    //         }else{
    //             res.status(200).json({success: true})
    //             return []
    //         }
    //     })
    //     .catch(err => {
            
    //         console.log(err)
    //         res.status(400).json({success: false, error:err})
    //     });
    // })
    // .then(() => {
    //     console.log("Done TX")
    // }).catch((err)=>{
    //     console.log(err)
    //     return res.status(500).json({success: false, error:err})
    // });
});

// @route       GET api/postings/listPostings
// @desc        List all job postings from an employer
// @access      Private
router.get('/list', passport.authentication,  (req, res) => {
    var jwtPayload = req.body.jwtPayload;
    if(jwtPayload.userType != 1){
        return res.status(400).json({success:false, error:"Must be an recruiter to look at canidates"})
    }

    postgresdb.any(' \
        SELECT c.first_name, c.last_name, c.email, c.created_on, c.resume_id \
        FROM recruiter_candidate rc \
        INNER JOIN candidate c ON c.candidate_id = rc.candidate_id \
        WHERE rc.recruiter_id = $1 AND c.active \
        ORDER BY c.last_name ASC', [jwtPayload.id])
    .then((data) => {
        // Marshal data
        data = data.map(m=>{
            var timestamp = moment(m.created_on);
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

module.exports = router;