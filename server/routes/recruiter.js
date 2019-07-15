const express = require('express');
const router = express.Router();
const passport = require('../utils/passport');
const moment = require('moment');
const logger = require('../utils/logging');
const address = require('../utils/address');

//load input validation
const validateEmployerInput = require('../validation/recruiter');  

const db = require('../utils/db')
const postgresdb = db.postgresdb
const pgp = db.pgp
const camelColumnConfig = db.camelColumnConfig
const recruiterFields = ['first_name', 'last_name', 'phone_number', 'image_id', 'address_id'];
const recruiterInsert = new pgp.helpers.ColumnSet(['recruiter_id', ...recruiterFields].map(camelColumnConfig), {table: 'recruiter'});
const recruiterUpdate = new pgp.helpers.ColumnSet(['?recruiter_id', ...recruiterFields.map(camelColumnConfig)], {table: 'recruiter'});
const recruiterJobTypeInsert = new pgp.helpers.ColumnSet(['recruiter_id', 'job_type_id'].map(camelColumnConfig), {table: 'recruiter_job_type'});

const upload = require('../utils/upload')
const uploadMiddleware = upload.generateUploadMiddleware('profile_image/')

/**
 * Upload recruiter Recruiter
 * @route GET api/recruiter/uploadImage
 * @group recruiter - Recruiter
 * @param {Object} body.optional
 * @returns {object} 200 - A map of profile information
 * @returns {Error}  default - Unexpected error
 * @access Private
 */
router.post('/uploadImage', passport.authentication, upload.uploadJwtParams, uploadMiddleware.any('filepond'), (req, res) => {
    var jwtPayload = req.params.jwtPayload;
    if(jwtPayload.userType != 1){
        const errorMessage = "Invalid User Type"
        logger.error('Route Params Mismatch', {tags:['validation'], url:req.originalUrl, userId:jwtPayload.id, body: req.body, params: req.params, error:errorMessage});
        return res.status(400).json({success:false, error:errorMessage})
    }
    logger.info('Uploaded Image', {tags:['upload', 'image'], url:req.originalUrl, userId:jwtPayload.id, body:req.body, params:req.params})
    postgresdb.none('UPDATE recruiter SET image_id=$1 WHERE recruiter_id = $2', [req.params.fileId, jwtPayload.id])
    .then((data) => {
        res.json({success:true, imageId:req.params.fileId})
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
        logger.error('Route Params Mismatch', {tags:['validation'], url:req.originalUrl, userId:jwtPayload.id, body: req.body, params: req.params, error:errorMessage});
        return res.status(400).json({success:false, error:errorMessage})
    }
    
    postgresdb.one('\
        SELECT email, first_name as "firstName", last_name as "lastName", \
            phone_number as "phoneNumber", image_id as "imageId", \
            job_type_id as "jobTypeId", a.* \
        FROM recruiter r \
        LEFT JOIN (\
            SELECT recruiter_id, array_agg(job_type_id) as job_type_id\
            FROM recruiter_job_type \
            WHERE recruiter_id = ${recruiterId} \
            GROUP BY recruiter_id) rjt ON rjt.recruiter_id = r.recruiter_id \
        INNER JOIN login l ON l.user_id = r.recruiter_id \
        LEFT JOIN address a ON a.address_id = r.address_id \
        WHERE r.recruiter_id = ${recruiterId}', {recruiterId:jwtPayload.id})
    .then((data) => {
        res.json({success:true, profile: address.convertFieldsToMap(db.camelizeFields(data))})
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
        logger.error('Route Params Mismatch', {tags:['validation'], url:req.originalUrl, userId:jwtPayload.id, body: req.body, params: req.params, error:errorMessage});
        return res.status(400).json({success:false, errors:errors});
    }
    var body = req.body;
    var jwtPayload = body.jwtPayload;
    if(jwtPayload.userType != 1){
        const errorMessage = "Invalid User Type"
        logger.error('Route Params Mismatch', {tags:['validation'], url:req.originalUrl, userId:jwtPayload.id, body: req.body, params: req.params, error:errorMessage});
        return res.status(400).json({success:false, error:errorMessage})
    }
    if(body.address == null) body.address = {}
    
    postgresdb.tx(t => {
        var addressId = body.address.addressId;
        // creating a sequence of transaction queries:
        var q1
        if(addressId == null){
            q1 = address.addAddress(body.address, t)
        }else{
            q1 = Promise.resolve({address_id:addressId})
        }
        return q1.then((addr_ret)=>{
            addressId = addressId != null ? addressId : addr_ret.address_id
            const q2 = t.none('DELETE FROM recruiter_job_type WHERE recruiter_id = ${recruiterId}', {recruiterId:jwtPayload.id})
            const q3 = t.none(pgp.helpers.update({...body, addressId:addr_ret.address_id}, recruiterUpdate, null, {emptyUpdate:true}) + ' WHERE recruiter_id = ${recruiterId}', {recruiterId: jwtPayload.id})
            const jobTypeData = body.jobTypeId.map(d=>{return {jobTypeId:d, recruiterId:jwtPayload.id}})
            const q4 = t.none(pgp.helpers.insert(jobTypeData, recruiterJobTypeInsert))
            return t.batch([q2, q3, q4])
                .then(() => {
                    res.status(200).json({success: true})
                    return []
                })
        })
    }).catch((err)=>{
        logger.error('Recruiter SQL Call Failed', {tags:['sql'], url:req.originalUrl, userId:jwtPayload.id, error:err.message || err, body:req.body});
        return res.status(500).json({success: false, error:err})
    });
});

/**
 * Set posting to be read
 * @route GET api/recruiter/alerts/setRead/:postId/:candidateId
 * @group recruiter - Recruiter
 * @param {Object} body.optional
 * @returns {object} 200 - A list of alert information
 * @returns {Error}  default - Unexpected error
 * @access Private
 */
// router.post('/setRead/:postId/:candidateId', passport.authentication,  (req, res) => {
//     var jwtPayload = req.body.jwtPayload;
//     var postId = req.params.postId
//     var candidateId = req.params.candidateId
//     if(jwtPayload.userType != 1){
//         const errorMessage = "Invalid User Type"
//         logger.error('Route Params Mismatch', {tags:['validation'], url:req.originalUrl, userId:jwtPayload.id, body: req.body, params: req.params, error:errorMessage});
//         return res.status(400).json({success:false, error:errorMessage})
//     }
//     if(postId == null){
//         const errorMessage = "Missing Post Id"
//         logger.error('Route Params Mismatch', {tags:['validation'], url:req.originalUrl, userId:jwtPayload.id, body: req.body, params: req.params, error:errorMessage});
//         return res.status(400).json({success:false, error:errorMessage})
//     }
//     if(candidateId == null){
//         const errorMessage = "Missing Candidate Id"
//         logger.error('Route Params Mismatch', {tags:['validation'], url:req.originalUrl, userId:jwtPayload.id, body: req.body, params: req.params, error:errorMessage});
//         return res.status(400).json({success:false, error:errorMessage})
//     }
//     postgresdb.none('UPDATE candidate_posting SET has_seen_response=true \
//         WHERE cp.recruiter_id = ${recruiterId} AND cp.candidate_id = ${candidateId} AND cp.post_id = ${postId}', 
//         {recruiterId: jwtPayload.id, candidateId:candidateId, postId:postId})
//     .then((data) => {
//         res.json({success:true})
//     })
//     .catch(err => {
//         logger.error('Recruiter SQL Call Failed', {tags:['sql'], url:req.originalUrl, userId:jwtPayload.id, error:err.message || err, body:req.body});
//         res.status(500).json({success:false, error:err})
//     });
// });
module.exports = router;