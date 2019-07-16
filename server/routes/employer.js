const express = require('express');
const router = express.Router();
const passport = require('../utils/passport');
const moment = require('moment');
const logger = require('../utils/logging');
const accessToken = require('../utils/accessToken');
const ses = require('../utils/ses')

//load input validation
const validateEmployerInput = require('../validation/employer');  

const db = require('../utils/db')
const postgresdb = db.postgresdb
const pgp = db.pgp

const upload = require('../utils/upload')
const uploadMiddleware = upload.generateUploadMiddleware('profile_image/')

/**
 * Upload recruiter profile image
 * @route GET api/employer/uploadImage
 * @group employer - Employer
 * @param {Object} body.optional
 * @returns {object} 200 - A map of profile information
 * @returns {Error}  default - Unexpected error
 * @access Private
 */
router.post('/uploadImage', passport.authentication, upload.uploadJwtParams, uploadMiddleware.any('filepond'), (req, res) => {
    var jwtPayload = req.params.jwtPayload;
    if(jwtPayload.userType != 3){
        const errorMessage = "Invalid User Type"
        logger.error('Route Params Mismatch', {tags:['validation'], url:req.originalUrl, userId:jwtPayload.id, body: req.body, params: req.params, error:errorMessage});
        return res.status(400).json({success:false, error:errorMessage})
    }
    logger.info('Uploaded Image', {tags:['upload', 'image'], url:req.originalUrl, userId:jwtPayload.id, body:req.body, params:req.params})
    postgresdb.none('UPDATE employer SET image_id=$1 WHERE employer_id = $2', [req.params.fileId, jwtPayload.id])
    .then((data) => {
        res.json({success:true, imageId:req.params.fileId})
    })
    .catch(err => {
        logger.error('Employer SQL Call Failed', {tags:['sql'], url:req.originalUrl, userId:jwtPayload.id, error:err.message || err, body:req.body});
        res.status(500).json({success:false, error:err})
    });
});

/**
 * Get employer contact list
 * @route GET api/employer/getEmployerContactList
 * @group employer - Employer
 * @param {Object} body.optional
 * @returns {object} 200 - A list of contacts
 * @returns {Error}  default - Unexpected error
 * @access Private
 */
router.get('/getAccountManagers', passport.authentication,  getAccountManagers)
router.get('/getAccountManagers/:page', passport.authentication,  getAccountManagers)
router.get('/getAccountManagers/search/:searchString', passport.authentication,  getAccountManagers)
router.get('/getAccountManagers/search/:searchString/:page', passport.authentication,  getAccountManagers)
function getAccountManagers(req, res) {
    var jwtPayload = req.body.jwtPayload;
    if(jwtPayload.userType != 2){
        const errorMessage = "Invalid User Type"
        logger.error('Route Params Mismatch', {tags:['validation'], url:req.originalUrl, userId:jwtPayload.id, body: req.body, params: req.params, error:errorMessage});
        return res.status(400).json({success:false, error:errorMessage})
    }
    var page = req.params.page;
    var searchString = req.params.searchString;
    if(searchString != null)
        searchString = searchString.toLowerCase().split(' ').map(d=>d+":*").join(" & ")
    if(page == null || page < 1)
        page = 1;
    postgresdb.any('\
        SELECT l.user_id as "userId", l.email, ac.first_name as "firstName", ac.last_name as "lastName", \
            ac.phone_number as "phoneNumber", ac.image_id as "imageId", l.created_on as "createdOn", \
            (count(1) OVER())/10+1 as "pageCount" \
        FROM account_manager ac \
        INNER JOIN login l ON l.user_id = ac.account_manager_id \
        WHERE l.user_type_id = 2 AND l.active \
        '+(searchString != null?' \
        AND ((name_search) @@ to_tsquery(\'simple\', ${searchString})) \
        ORDER BY ts_rank_cd(name_search, to_tsquery(\'simple\', ${searchString})) DESC \
        ':
        'ORDER BY ac.last_name ASC, ac.first_name ASC ')+
        'OFFSET ${page} \
        LIMIT 10', {page:(page-1)*10, searchString:searchString})
    .then((data) => { 
        data = data.map(m=>{
            var timestamp = moment(m.createdOn);
            var ms = timestamp.diff(moment());
            m.created = moment.duration(ms).humanize() + " ago";
            m.createdOn = timestamp.format("x");
            return m
        })
        res.json({success: true, accountManagers:data})
    })
    .catch(err => {
        logger.error('Employer SQL Call Failed', {tags:['sql'], url:req.originalUrl, userId:jwtPayload.id, error:err.message || err, body:req.body});
        res.status(500).json({success: false, error:err})
    });
}
/**
 * Get information of the plan
 * @route GET api/employer/getPlanInformation
 * @group employer - Employer
 * @param {Object} body.optional
 * @returns {object} 200 - The plan information
 * @returns {Error}  default - Unexpected error
 * @access Private
 */
router.get('/getPlanInformation', passport.authentication,  getPlanInformation)
function getPlanInformation(req, res) {
    var jwtPayload = req.body.jwtPayload;
    if(jwtPayload.userType != 3){
        const errorMessage = "Invalid User Type"
        logger.error('Route Params Mismatch', {tags:['validation'], url:req.originalUrl, userId:jwtPayload.id, body: req.body, params: req.params, error:errorMessage});
        return res.status(400).json({success:false, error:errorMessage})
    }
    postgresdb.one('\
        SELECT p.*, pt.plan_type_name \
        FROM login l \
        INNER JOIN company_contact cc ON cc.company_contact_id = l.user_id \
        INNER JOIN company c ON cc.company_id = c.company_id \
        INNER JOIN plan p ON p.company_id = c.company_id \
        INNER JOIN plan_type pt ON pt.plan_type_id = p.plan_type_id \
        WHERE c.active AND l.active AND l.user_id = ${userId}', {userId:jwtPayload.id})
    .then((data) => {
        data = db.camelizeFields(data)
        var timestamp = moment(data.subscriptionExpiry);
        var ms = timestamp.diff(moment());
        data.subscriptionExpiry = moment.duration(ms).humanize() + " ago";
        data.subscriptionExpiryOn = timestamp.format("x");
        res.json({success: true, plan:data})
    })
    .catch(err => {
        logger.error('Plan Information SQL Call Failed', {tags:['sql'], url:req.originalUrl, userId:jwtPayload.id, error:err.message || err, body:req.body});
        res.status(500).json({success: false, error:err})
    });
}
/**
 * Get information of open postings
 * @route GET api/employer/getOpenPostings
 * @group employer - Employer
 * @param {Object} body.optional
 * @returns {object} 200 - The plan information
 * @returns {Error}  default - Unexpected error
 * @access Private
 */
router.get('/getOpenPostings', passport.authentication,  getOpenPostings)
function getOpenPostings(req, res) {
    var jwtPayload = req.body.jwtPayload;
    if(jwtPayload.userType != 3){
        const errorMessage = "Invalid User Type"
        logger.error('Route Params Mismatch', {tags:['validation'], url:req.originalUrl, userId:jwtPayload.id, body: req.body, params: req.params, error:errorMessage});
        return res.status(400).json({success:false, error:errorMessage})
    }
    postgresdb.one('\
        SELECT SUM(j.open_positions) as open_positions, SUM(j.salary*j.open_positions) as salary_used \
        FROM login l \
        INNER JOIN company_contact cc ON cc.company_contact_id = l.user_id \
        INNER JOIN company c ON cc.company_id = c.company_id \
        INNER JOIN job_posting_all j ON j.company_id = c.company_id \
        WHERE c.active AND l.active AND l.user_id = ${userId}', {userId:jwtPayload.id})
    .then((data) => {
        data = db.camelizeFields(data)
        res.json({success: true, openPostings:data})
    })
    .catch(err => {
        logger.error('Open Postings SQL Call Failed', {tags:['sql'], url:req.originalUrl, userId:jwtPayload.id, error:err.message || err, body:req.body});
        res.status(500).json({success: false, error:err})
    });
}
/**
 * Get employer jwt token
 * @route GET api/employer/generateToken
 * @group employer - Employer
 * @param {Object} body.optional
 * @returns {object} 200 - A list of contacts
 * @returns {Error}  default - Unexpected error
 * @access Private
 */
router.post('/generateToken', passport.authentication,  generateToken)
function generateToken(req, res) {
    const jwtPayload = req.body.jwtPayload;
    if(jwtPayload.userType != 2){
        const errorMessage = "Invalid User Type"
        logger.error('Route Params Mismatch', {tags:['validation'], url:req.originalUrl, userId:jwtPayload.id, body: req.body, params: req.params, error:errorMessage});
        return res.status(400).json({success:false, error:errorMessage})
    }
    if(req.body.userId == null){
        const errorMessage = "Missing Parameter userId"
        logger.error('Route Params Mismatch', {tags:['validation'], url:req.originalUrl, userId:jwtPayload.id, body: req.body, params: req.params, error:errorMessage});
        return res.status(400).json({success:false, error:errorMessage})
    }
    return accessToken.generateAccessToken(req.body.userId)
    .then((payload) => { 
        return ses.sendJobPostLink(payload)
    })
    .then(() => { 
        res.json({success: true})
    })
    .catch(err => {
        logger.error('Employer SQL Call Failed', {tags:['sql'], url:req.originalUrl, userId:jwtPayload.id, error:err.message || err, body:req.body});
        res.status(500).json({success: false, error:err})
    });
}
function test(id){
    accessToken.generateAccessToken(id)
    .then(token=>{
        console.log('/postJob/'+token)
    })
    .catch(err => {
        logger.error('Employer SQL Call Failed', {tags:['sql'], error:err.message || err});
    });
}
test(400)
module.exports = router;