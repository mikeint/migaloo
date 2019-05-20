const express = require('express');
const router = express.Router();
const passport = require('../config/passport');
const moment = require('moment');
const logger = require('../utils/logging');

//load input validation
const validateEmployerInput = require('../validation/employer');  

const db = require('../config/db')
const postgresdb = db.postgresdb
const pgp = db.pgp
const generateUploadMiddleware = require('../utils/upload').generateUploadMiddleware
const upload = generateUploadMiddleware('profile_image/')

const generateImageFileNameAndValidation = (req, res, next) => {
    // Validate this candidate is with this recruiter
    var jwtPayload = req.body.jwtPayload;
    if(jwtPayload.userType != 2){
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
    postgresdb.none('UPDATE employer SET image_id=$1 WHERE company_id = $2', [req.params.finalFileName, jwtPayload.id])
    .then((data) => {
        res.json({success:true, image_id:req.params.finalFileName})
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
        logger.error('Route Params Mismatch', {tags:['validation'], url:req.originalUrl, userId:jwtPayload.id, body: req.body, error:errorMessage});
        return res.status(400).json({success:false, error:errorMessage})
    }
    var page = req.params.page;
    var searchString = req.params.searchString;
    if(searchString != null)
    searchString = searchString.split(' ').map(d=>d+":*").join(" & ")
    if(page == null)
        page = 1;
    postgresdb.any('\
        SELECT l.user_id, l.email, ac.first_name, ac.last_name, \
            ac.phone_number, ac.image_id, l.created_on, \
            (count(1) OVER())/10+1 AS page_count \
        FROM account_manager ac \
        INNER JOIN login l ON l.user_id = ac.account_manager_id \
        WHERE l.user_type_id = 2 AND ac.active \
        '+(searchString?' \
        AND ((name_search) @@ to_tsquery(\'simple\', ${searchString})) \
        ORDER BY ts_rank_cd(name_search, to_tsquery(\'simple\', ${searchString})) DESC ':
        'ORDER BY ac.last_name ASC, ac.first_name ASC ')+
        'OFFSET ${page} \
        LIMIT 10', {page:(page-1)*10, searchString:searchString})
    .then((data) => { 
        data = data.map(m=>{
            var timestamp = moment(m.created_on);
            var ms = timestamp.diff(moment());
            m.created = moment.duration(ms).humanize() + " ago";
            m.created_on = timestamp.format("x");
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
 * Get employer jwt token
 * @route GET api/employer/generateToken
 * @group employer - Employer
 * @param {Object} body.optional
 * @returns {object} 200 - A list of contacts
 * @returns {Error}  default - Unexpected error
 * @access Private
 */
router.get('/generateToken', passport.authentication,  generateToken)
function generateToken(req, res) {
    var jwtPayload = req.body.jwtPayload;
    if(jwtPayload.userType != 2){
        const errorMessage = "Invalid User Type"
        logger.error('Route Params Mismatch', {tags:['validation'], url:req.originalUrl, userId:jwtPayload.id, body: req.body, error:errorMessage});
        return res.status(400).json({success:false, error:errorMessage})
    }
    postgresdb.one('\
        SELECT l.user_id, l.email, c.company_name \
        FROM company c \
        INNER JOIN login l ON l.user_id = c.company_id \
        WHERE c.active AND l.user_id = ${user_id}', {user_id:req.body.user_id})
    .then((args) => { 
        const randNumber = Math.trunc(Math.random()*100000000)
        const jwtPayload = {
            user_id: args.user_id,
            name: args.name,
            userType: 4,
            email: args.email,
            rand: randNumber
        }
        passport.signToken(jwtPayload, 'never').then(token=>{
            res.json({success: true, token:token})
        })
    })
    .catch(err => {
        logger.error('Employer SQL Call Failed', {tags:['sql'], url:req.originalUrl, userId:jwtPayload.id, error:err.message || err, body:req.body});
        res.status(500).json({success: false, error:err})
    });
}

module.exports = router;