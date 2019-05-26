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
        logger.info('Upload Image', {tags:['image', 's3'], userId:jwtPayload.id});
        res.json({success:true, image_id:req.params.finalFileName})
    })
    .catch(err => {
        logger.error('Upload Image', {tags:['image', 's3'], url:req.originalUrl, userId:jwtPayload.id, error:err});
        res.status(500).json({success:false, error:err})
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
        const errorMessage = "Invalid User Type"
        logger.error('Route Params Mismatch', {tags:['validation'], url:req.originalUrl, userId:jwtPayload.id, body: req.body, error:errorMessage});
        return res.status(400).json({success:false, error:errorMessage})
    }
    
    postgresdb.one('\
        SELECT email, first_name as "firstName", last_name as "lastName", \
            phone_number as "phoneNumber", ac.image_id, \
            a.address_id as "addressId", a.address_line_1 as "addressLine1", a.address_line_2 as "addressLine2", a.city, a.state_province as "stateProvince", \
            a.state_province_code as "stateProvinceCode", a.postal_code as "postalCode", a.place_id as "placeId", a.country, a.country_code as "countryCode" \
        FROM account_manager ac \
        INNER JOIN login l ON l.user_id = ac.account_manager_id \
        LEFT JOIN address a ON a.address_id = ac.address_id \
        WHERE ac.account_manager_id = $1', [jwtPayload.id])
    .then((data) => {
        res.json({success: true, profile:db.camelizeFields(data)})
    })
    .catch(err => {
        logger.error('Get Profile', {tags:['sql'], url:req.originalUrl, userId:jwtPayload.id, error:err.message || err, body:req.body});
        res.status(500).json({success:false, error:err})
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
        const errorMessage = "Invalid parameters"
        logger.error('Route Params Mismatch', {tags:['validation'], url:req.originalUrl, userId:jwtPayload.id, body: req.body, error:errorMessage});
        return res.status(400).json({success:false, errors:errors});
    }
    var body = req.body;
    var jwtPayload = body.jwtPayload;
    if(jwtPayload.userType != 2){
        const errorMessage = "Invalid User Type"
        logger.error('Route Params Mismatch', {tags:['validation'], url:req.originalUrl, userId:jwtPayload.id, body: req.body, error:errorMessage});
        return res.status(400).json({success:false, error:errorMessage})
    }
    var fields = ['first_name', 'last_name', 'phone_number'];
    postgresdb.one('SELECT first_name, last_name, phone_number \
                    FROM account_manager e \
                    WHERE account_manager_id = ${account_manager_id}', {account_manager_id:jwtPayload.id}).then((data)=>{
        var fieldUpdates = fields.map(f=> body[f] != null?body[f]:data[f]);
        postgresdb.none('UPDATE account_manager SET first_name=$1, last_name=$2, phone_number=$3 WHERE account_manager_id = $4',
            [...fieldUpdates, jwtPayload.id])
        .then(() => {
            res.status(200).json({success: true})
        }).catch((err)=>{
            logger.error('Set Profile', {tags:['sql'], url:req.originalUrl, userId:jwtPayload.id, error:err.message || err, body:req.body});
            return res.status(500).json({success: false, error:err})
        });
    })
});

module.exports = router;