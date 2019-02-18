const express = require('express');
const router = express.Router();
const passport = require('../../config/passport');

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
            street_address_1, street_address_2, city, state, country \
        FROM job_posting j \
        LEFT JOIN experience_type et ON j.experience_type_id = et.experience_type_id \
        INNER JOIN employer e ON j.employer_id = e.employer_id \
        LEFT JOIN address a ON a.address_id = e.address_id \
        OFFSET $1 LIMIT 10', [(page-1)*10])
    .then((data) => {
        res.json(data)
    })
    .catch(err => {
        res.status(400).json(err)
    });
}
// @route       GET api/jobs/listJobs
// @desc        List all available job postings
// @access      Private
router.get('/listJobs', passport.authentication, getJobs);
router.get('/listJobs/:page', passport.authentication, getJobs);

// router.get('/listJobsForCandidate/:candidateId', passport.authentication,  (req, res) => {
//     var candidateId = req.params.candidateId
//     if(candidateId == null)
//         return res.status(400).json({success:false, error:"Missing Candidate Id"})
    
//     var jwtPayload = body.jwtPayload;
//     if(jwtPayload.userType != 1){
//         return res.status(400).json({success:false, error:"Must be a recruiter to look for postings"})
//     }
//     postgresdb.any('\
//         SELECT title, caption, experience_type_name, company_name, image_id, \
//             street_address_1, street_address_2, city, state, country \
//         FROM job_posting j \
//         LEFT JOIN experience_type et ON j.experience_type_id = et.experience_type_id \
//         INNER JOIN employer e ON j.employer_id = e.employer_id \
//         LEFT JOIN address a ON a.address_id = e.address_id', [candidateId])
//     // const { errors, isValid } = validateProfileInput(req.body);
//     // //check Validation
//     // if(!isValid) {
//     //     return res.status(400).json(errors);
//     // }
//     // var jwtPayload = body.jwtPayload;

//     postgresdb.any('\
//         SELECT title, caption, experience_type_name, company_name, image_id, \
//             street_address_1, street_address_2, city, state, country \
//         FROM job_posting j \
//         LEFT JOIN experience_type et ON j.experience_type_id = et.experience_type_id \
//         INNER JOIN employer e ON j.employer_id = e.employer_id \
//         LEFT JOIN address a ON a.address_id = e.address_id', [])
//     .then((data) => {
//         res.json(data)
//     })
//     .catch(err => {
//         res.status(400).json(err)
//     });
// });

module.exports = router;