const express = require('express');
const router = express.Router();
const passport = require('../../config/passport');

const postgresdb = require('../../config/db').postgresdb

// @route       POST api/profile/saveType
// @desc        Add type to profile
// @access      Private
router.get('/listJobs', passport.authentication,  (req, res) => {
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
        LEFT JOIN address a ON a.address_id = e.address_id', [])
    .then((data) => {
        res.json(data)
    })
    .catch(err => {
        res.status(400).json(err)
    });
});

// router.get('/listJobsForCandidate', passport.authentication,  (req, res) => {
//     var candidateId = req.body.candidateId
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