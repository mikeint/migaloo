const express = require('express');
const router = express.Router();
const passport = require('../utils/passport');
const db = require('../utils/db')
const postgresdb = db.postgresdb
const useAWS = process.env.AWS ? true : false;
const aws = require('aws-sdk');
var s3 = new aws.S3()
const logger = require('../utils/logging');
const settings = require('../config/settings');
const bucketName = settings.uploads.bucketName;
const supportedMimeTypes = settings.uploads.supportedMimeTypes;

/**
 * Get image
 * @route GET api/profileImage/view
 * @group profileImage - Profile Image
 * @param {Object} body.optional
 * @returns {object} 200 - A map of profile information
 * @returns {Error}  default - Unexpected error
 * @access Private
 */
router.get('/view/:type/:size', passport.authentication, getImage)
router.get('/view/:type/:size/:id', passport.authentication, getImage)
function getImage(req, res) {
    const jwtPayload = req.body.jwtPayload;
    if(req.params.size == null){
        const errorMessage = "Missing Size"
        logger.error('Route Params Mismatch', {tags:['validation'], url:req.originalUrl, userId:jwtPayload.id, body: req.body, params: req.params, error:errorMessage});
        return res.status(400).json({success:false, error:errorMessage})
    }
    const id = req.params.id == null ? jwtPayload.id : req.params.id
    const type = req.params.type
    var query;
    if(type === 'recruiter'){
        query = '\
        SELECT r.image_id, fu.mime_type \
        FROM recruiter r \
        LEFT JOIN file_upload fu ON fu.file_id = r.image_id \
        WHERE r.recruiter_id = $1'
    }else if(type === 'accountManager'){
        query = '\
        SELECT r.image_id, fu.mime_type \
        FROM account_manager r \
        LEFT JOIN file_upload fu ON fu.file_id = r.image_id \
        WHERE r.account_manager_id = $1'
    }else if(type === 'company'){
        query = '\
        SELECT r.image_id, fu.mime_type \
        FROM company r \
        LEFT JOIN file_upload fu ON fu.file_id = r.image_id \
        WHERE r.company_id = $1'
    }else if(type === 'candidate'){
        query = '\
        SELECT r.image_id, fu.mime_type \
        FROM candidate r \
        LEFT JOIN file_upload fu ON fu.file_id = r.image_id \
        WHERE r.candidate_id = $1'
    }else{
        const errorMessage = "Wrong Type"
        logger.error('Route Params Mismatch', {tags:['validation'], url:req.originalUrl, userId:jwtPayload.id, body: req.body, params: req.params, error:errorMessage});
        return res.status(400).json({success:false, error:errorMessage})
    }
    postgresdb.one(query, [id])
    .then((data) => {
        if(data.image_id != null){
            const ext = supportedMimeTypes[data.mime_type]
            if(useAWS){
                const params = {Bucket: bucketName, Key: `profile_image/${req.params.size}_${data.image_id}.${ext}`};
                s3.getSignedUrl('getObject', params, function (err, url) {
                    if(err != null)
                        return res.status(500).json({success:false, error:err})
                    res.json({success:true, url:url})
                });
            }else{
                res.json({success:true, url:`http://localhost:5000/api/public/profile_image/${req.params.size}_${data.image_id}.${ext}`})
            }
        }else{
            res.json({success:false})
        }
    })
    .catch(err => {
        logger.error('Notification SQL Call Failed', {tags:['sql'], url:req.originalUrl, userId:jwtPayload.id, error:err.message || err, body:req.body});
        res.status(500).json({success:false, error:err})
    });
}

module.exports = router;