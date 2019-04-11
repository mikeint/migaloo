const express = require('express');
const router = express.Router();
const passport = require('../../config/passport');
const moment = require('moment');

//load input validation
const validateEmployerInput = require('../../validation/employer');  

const db = require('../../config/db')
const postgresdb = db.postgresdb
const pgp = db.pgp
const generateUploadMiddleware = require('../upload').generateUploadMiddleware
const upload = generateUploadMiddleware('profile_image/')

const generateImageFileNameAndValidation = (req, res, next) => {
    // Validate this candidate is with this recruiter
    var jwtPayload = req.body.jwtPayload;
    if(jwtPayload.userType != 2){
        return res.status(400).json({success:false, error:"Must be an account manager for this"})
    }
    var now = Date.now()
    req.params.fileName = jwtPayload.id+"_image_"+now.toString()
    req.params.jwtPayload = jwtPayload
    next()
}

/**
 * Upload recruiter profile image
 * @route GET api/employer/uploadImage
 * @group employer - Employer
 * @param {Object} body.optional
 * @returns {object} 200 - A map of profile information
 * @returns {Error}  default - Unexpected error
 * @access Private
 */
router.post('/uploadImage', passport.authentication, generateImageFileNameAndValidation, upload.any('filepond'), (req, res) => {
    var jwtPayload = req.params.jwtPayload;
    postgresdb.none('UPDATE employer SET image_id=$1 WHERE employer_id = $2', [req.params.finalFileName, jwtPayload.id])
    .then((data) => {
        res.json({success:true, image_id:req.params.finalFileName})
    })
    .catch(err => {
        console.log(err)
        res.status(400).json(err)
    });
});

/**
 * Get employer profile information
 * @route GET api/employer/getProfile
 * @group employer - Employer
 * @param {Object} body.optional
 * @returns {object} 200 - A map of profile information
 * @returns {Error}  default - Unexpected error
 * @access Private
 */
router.get('/getProfile', passport.authentication,  (req, res) => {
    var jwtPayload = req.body.jwtPayload;
    if(jwtPayload.userType != 2){
        return res.status(400).json({success:false, error:"Must be an account manager for this"})
    }
    
    postgresdb.one('\
        SELECT email, first_name, last_name, \
            phone_number, ac.image_id, \
            address_line_1, address_line_2, city, state, country \
        FROM account_manager ac \
        INNER JOIN login l ON l.user_id = ac.account_manager_id \
        LEFT JOIN address a ON a.address_id = ac.address_id \
        WHERE ac.account_manager_id = $1', [jwtPayload.id])
    .then((data) => {
        res.json(data)
    })
    .catch(err => {
        console.log(err)
        res.status(400).json(err)
    });
});

/**
 * Set employer profile information
 * @route POST api/employer/setProfile
 * @group employer - Employer
 * @param {Object} body.optional
 * @returns {object} 200 - An array of user info
 * @returns {Error}  default - Unexpected error
 * @access Private
 */
router.post('/setProfile', passport.authentication,  (req, res) => {
    const { errors, isValid } = validateEmployerInput(req.body);
    //check Validation
    if(!isValid) {
        return res.status(400).json(errors);
    }
    var bodyData = req.body;
    var jwtPayload = bodyData.jwtPayload;
    if(jwtPayload.userType != 2){
        return res.status(400).json({success:false, error:"Must be an account manager for this"})
    }
    var fields = ['first_name', 'last_name', 'phone_number'];
    postgresdb.one('SELECT first_name, last_name, phone_number \
                    FROM account_manager e \
                    WHERE account_manager_id = ${account_manager_id}', {account_manager_id:jwtPayload.id}).then((data)=>{
        var fieldUpdates = fields.map(f=> bodyData[f] != null?bodyData[f]:data[f]);
        postgresdb.none('UPDATE account_manager SET first_name=$1, last_name=$2, phone_number=$3 WHERE account_manager_id = $4',
            [...fieldUpdates, jwtPayload.id])
        .then(() => {
            res.status(200).json({success: true})
        }).catch((err)=>{
            console.log(err)
            return res.status(500).json({success: false, error:err})
        });
    })
});
/**
 * Get employer alerts
 * @route GET api/employer/alerts
 * @group employer - Employer
 * @param {Object} body.optional
 * @returns {object} 200 - A list of alert information
 * @returns {Error}  default - Unexpected error
 * @access Private
 */
router.get('/alerts', passport.authentication,  (req, res) => {
    var jwtPayload = req.body.jwtPayload;
    if(jwtPayload.userType != 2){
        return res.status(400).json({success:false, error:"Must be an account manager for this"})
    }
    
    postgresdb.any('\
        SELECT c.candidate_id, jp.post_id, cp.created_on, c.first_name, coins, count(1) OVER() AS alert_count, jp.title \
        FROM candidate_posting cp \
        INNER JOIN job_posting jp ON cp.post_id = jp.post_id \
        INNER JOIN candidate c ON c.candidate_id = cp.candidate_id \
        INNER JOIN employer_contact ec ON ec.employer_id = jp.employer_id \
        WHERE NOT cp.has_seen_post AND ec.employer_contact_id = ${employer_contact_id} \
        ORDER BY created_on DESC \
        LIMIT 10', {employer_contact_id:jwtPayload.id})
    .then((data) => {
        // Marshal data
        data = data.map(m=>{
            var timestamp = moment(m.created_on);
            var ms = timestamp.diff(moment());
            m.created = moment.duration(ms).humanize() + " ago";
            m.created_on = timestamp.format("x");
            return m
        })
        res.json({success:true, alertList:data})
    })
    .catch(err => {
        console.log(err)
        res.status(400).json(err)
    });
});


module.exports = router;