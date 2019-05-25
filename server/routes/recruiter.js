const express = require('express');
const router = express.Router();
const passport = require('../config/passport');
const moment = require('moment');
const logger = require('../utils/logging');

//load input validation
const validateEmployerInput = require('../validation/recruiter');  

const db = require('../config/db')
const postgresdb = db.postgresdb
const pgp = db.pgp
const generateUploadMiddleware = require('../utils/upload').generateUploadMiddleware
const upload = generateUploadMiddleware('profile_image/')

const generateImageFileNameAndValidation = (req, res, next) => {
    // Validate this candidate is with this recruiter
    var jwtPayload = req.body.jwtPayload;
    if(jwtPayload.userType != 1){
        const errorMessage = "Invalid User Type"
        logger.error('Route Params Mismatch', {tags:['validation'], url:req.originalUrl, userId:jwtPayload.id, body: req.body, error:errorMessage});
        return res.status(400).json({success:false, error:errorMessage})
    }
    var now = Date.now()
    req.params.fileName = jwtPayload.id+"_image_"+now.toString()
    req.params.jwtPayload = jwtPayload
    next()
}

/**
 * Upload recruiter Recruiter
 * @route GET api/recruiter/uploadImage
 * @group recruiter - Recruiter
 * @param {Object} body.optional
 * @returns {object} 200 - A map of profile information
 * @returns {Error}  default - Unexpected error
 * @access Private
 */
router.post('/uploadImage', passport.authentication, generateImageFileNameAndValidation, upload.any('filepond'), (req, res) => {
    var jwtPayload = req.params.jwtPayload;
    postgresdb.none('UPDATE recruiter SET image_id=$1 WHERE recruiter_id = $2', [req.params.finalFileName, jwtPayload.id])
    .then((data) => {
        res.json({success:true, imageId:req.params.finalFileName})
    })
    .catch(err => {
        logger.error('Recruiter SQL Call Failed', {tags:['sql'], url:req.originalUrl, userId:jwtPayload.id, error:err.message || err, body:req.body});
        res.status(500).json({success:false, error:err})
    });
});

/**
 * Get recruiter profile information
 * @route GET api/recruiter/getProfile
 * @group recruiter - Recruiter
 * @param {Object} body.optional
 * @returns {object} 200 - A map of profile information
 * @returns {Error}  default - Unexpected error
 * @access Private
 */
router.get('/getProfile', passport.authentication,  (req, res) => {
    var jwtPayload = req.body.jwtPayload;
    if(jwtPayload.userType != 1){
        const errorMessage = "Invalid User Type"
        logger.error('Route Params Mismatch', {tags:['validation'], url:req.originalUrl, userId:jwtPayload.id, body: req.body, error:errorMessage});
        return res.status(400).json({success:false, error:errorMessage})
    }
    
    postgresdb.one('\
        SELECT email, first_name, last_name, \
            phone_number, image_id, \
            address_line_1, address_line_2, city, state_province, country \
        FROM recruiter r \
        INNER JOIN login l ON l.user_id = r.recruiter_id \
        LEFT JOIN address a ON a.address_id = r.address_id \
        WHERE r.recruiter_id = $1', [jwtPayload.id])
    .then((data) => {
        res.json(db.camelizeFields(data))
    })
    .catch(err => {
        logger.error('Recruiter SQL Call Failed', {tags:['sql'], url:req.originalUrl, userId:jwtPayload.id, error:err.message || err, body:req.body});
        res.status(500).json({success:false, error:err})
    });
});

/**
 * Set recruiter profile information
 * @route POST api/recruiter/setProfile
 * @group recruiter - Recruiter
 * @param {Object} body.optional
 * @returns {object} 200
 * @returns {Error}  default - Unexpected error
 * @access Private
 */
router.post('/setProfile', passport.authentication,  (req, res) => {
    const { errors, isValid } = validateEmployerInput(req.body);
    //check Validation
    if(!isValid) {
        const errorMessage = "Invalid Parameters"
        logger.error('Route Params Mismatch', {tags:['validation'], url:req.originalUrl, userId:jwtPayload.id, body: req.body, error:errorMessage});
        return res.status(400).json(errors);
    }
    var body = req.body;
    var jwtPayload = body.jwtPayload;
    if(jwtPayload.userType != 1){
        const errorMessage = "Invalid User Type"
        logger.error('Route Params Mismatch', {tags:['validation'], url:req.originalUrl, userId:jwtPayload.id, body: req.body, error:errorMessage});
        return res.status(400).json({success:false, error:errorMessage})
    }
    var fields = ['first_name', 'last_name', 'phone_number'];
    postgresdb.one('SELECT first_name, last_name, phone_number, r.address_id, address_line_1, address_line_2, city, state_province, country \
                    FROM recruiter r \
                    LEFT JOIN address a ON r.address_id = a.address_id\
                    WHERE recruiter_id = $1', [jwtPayload.id]).then((data)=>{
        var addressId = data.address_id;
        var addressIdExists = (data.address_id != null);
        var fieldUpdates = fields.map(f=> body[f] != null?body[f]:data[f]);
        return postgresdb.tx(t => {
            // creating a sequence of transaction queries:
            var q1
            if(!addressIdExists){
                q1 = address.addAddress(body, t)
            }else{
                r1 = Promise.resolve()
            }
            return q1.then((addr_ret)=>{
                addressId = addressIdExists ? addressId : addr_ret.address_id
                const q2 = t.none('UPDATE recruiter SET first_name=$1, last_name=$2, phone_number=$3, company_name=$4, address_id=$5 WHERE recruiter_id = $6',
                                [...fieldUpdates, addressId, jwtPayload.id]);
                return q2
                    .then(() => {
                        res.status(200).json({success: true})
                        return []
                    })
            })
        })
    }).catch((err)=>{
        logger.error('Recruiter SQL Call Failed', {tags:['sql'], url:req.originalUrl, userId:jwtPayload.id, error:err.message || err, body:req.body});
        return res.status(500).json({success: false, error:err})
    });
});

/**
 * Get recruiter alerts
 * @route GET api/recruiter/alerts
 * @group recruiter - Recruiter
 * @param {Object} body.optional
 * @returns {object} 200 - A list of alert information
 * @returns {Error}  default - Unexpected error
 * @access Private
 */
router.get('/alerts', passport.authentication,  (req, res) => {
    var jwtPayload = req.body.jwtPayload;
    if(jwtPayload.userType != 1){
        const errorMessage = "Invalid User Type"
        logger.error('Route Params Mismatch', {tags:['validation'], url:req.originalUrl, userId:jwtPayload.id, body: req.body, error:errorMessage});
        return res.status(400).json({success:false, error:errorMessage})
    }
    
    postgresdb.any('\
        SELECT cp.candidate_id, post_id, migaloo_accepted, migaloo_responded_on, coins, alert_count, c.first_name, c.last_name \
        FROM candidate_posting cp \
        LEFT JOIN (SELECT recruiter_id, count(1) as alert_count \
            FROM candidate_posting cpi \
            WHERE migaloo_responded_on IS NOT NULL AND NOT has_seen_response AND cpi.recruiter_id = $1 \
            GROUP BY cpi.recruiter_id \
        ) t ON t.recruiter_id = cp.recruiter_id \
        INNER JOIN candidate c ON c.candidate_id = cp.candidate_id \
        WHERE migaloo_responded_on IS NOT NULL AND NOT has_seen_response AND cp.recruiter_id = $1 \
        ORDER BY migaloo_responded_on DESC \
        LIMIT 10', [jwtPayload.id])
    .then((data) => {
        // Marshal data
        data = data.map(db.camelizeFields).map(m=>{
            var timestamp = moment(m.migalooRespondedOn);
            var ms = timestamp.diff(moment());
            m.responded = moment.duration(ms).humanize() + " ago";
            m.migalooRespondedOn = timestamp.format("x");
            return m
        })
        res.json({success:true, alertList:data})
    })
    .catch(err => {
        logger.error('Recruiter SQL Call Failed', {tags:['sql'], url:req.originalUrl, userId:jwtPayload.id, error:err.message || err, body:req.body});
        res.status(500).json({success:false, error:err})
    });
});

// @route       GET api/recruiter/setRead/:postId/:candidateId
// @desc        Set posting to be read
// @access      Private
router.post('/setRead/:postId/:candidateId', passport.authentication,  (req, res) => {
    var jwtPayload = req.body.jwtPayload;
    var postId = req.params.postId
    var candidateId = req.params.candidateId
    if(jwtPayload.userType != 1){
        const errorMessage = "Invalid User Type"
        logger.error('Route Params Mismatch', {tags:['validation'], url:req.originalUrl, userId:jwtPayload.id, body: req.body, error:errorMessage});
        return res.status(400).json({success:false, error:errorMessage})
    }
    if(postId == null){
        const errorMessage = "Missing Post Id"
        logger.error('Route Params Mismatch', {tags:['validation'], url:req.originalUrl, userId:jwtPayload.id, body: req.body, error:errorMessage});
        return res.status(400).json({success:false, error:errorMessage})
    }
    if(candidateId == null){
        const errorMessage = "Missing Candidate Id"
        logger.error('Route Params Mismatch', {tags:['validation'], url:req.originalUrl, userId:jwtPayload.id, body: req.body, error:errorMessage});
        return res.status(400).json({success:false, error:errorMessage})
    }
    postgresdb.none('UPDATE candidate_posting SET has_seen_response=true WHERE cp.recruiter_id = $1 AND cp.candidate_id = $2 AND cp.post_id = $3', [jwtPayload.id, candidateId, postId])
    .then((data) => {
        res.json({success:true})
    })
    .catch(err => {
        logger.error('Recruiter SQL Call Failed', {tags:['sql'], url:req.originalUrl, userId:jwtPayload.id, error:err.message || err, body:req.body});
        res.status(500).json({success:false, error:err})
    });
});
module.exports = router;