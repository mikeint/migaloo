const express = require('express');
const router = express.Router();
const passport = require('../config/passport');
const db = require('../config/db')
const postgresdb = db.postgresdb
const useAWS = process.env.AWS ? true : false;
const aws = require('aws-sdk');
var s3 = new aws.S3()
const logger = require('../utils/logging');

/**
 * Get image
 * @route GET api/profileImage/view
 * @group profileImage - Profile Image
 * @param {Object} body.optional
 * @returns {object} 200 - A map of profile information
 * @returns {Error}  default - Unexpected error
 * @access Private
 */
router.get('/view/:size', passport.authentication, getImage)
router.get('/view/:type/:id/:size', passport.authentication, getImage)
function getImage(req, res) {
    var jwtPayload = req.body.jwtPayload;
    if(req.params.size == null){
        const errorMessage = "Missing Size"
        logger.error('Route Params Mismatch', {tags:['validation'], url:req.originalUrl, userId:jwtPayload.id, body: req.body, params: req.params, error:errorMessage});
        return res.status(400).json({success:false, error:errorMessage})
    }
    var id = req.params.id == null ? jwtPayload.id : req.params.id
    var type = req.params.type == null ? jwtPayload.userType : parseInt(req.params.type, 10)
    var query;
    if(type === 1){
        query = '\
        SELECT image_id \
        FROM recruiter r \
        WHERE r.recruiter_id = $1'
    }else if(type === 2){
        query = '\
        SELECT image_id \
        FROM account_manager r \
        WHERE r.account_manager_id = $1'
    }else if(type === 4){
        query = '\
        SELECT image_id \
        FROM company r \
        WHERE r.company_id = $1'
    }else if(type === 5){
        query = '\
        SELECT image_id \
        FROM candidate r \
        WHERE r.candidate_id = $1'
    }
    postgresdb.one(query, [id])
    .then((data) => {
        if(data.image_id != null){
            if(useAWS){
                var params = {Bucket: bucketName, Key: 'profile_image/'+req.params.size+"_"+data.image_id};
                s3.getSignedUrl('getObject', params, function (err, url) {
                    if(err != null)
                        return res.status(500).json({success:false, error:err})
                    res.json({success:true, url:url})
                });
            }else{
                res.json({success:true, url:'http://localhost:5000/api/public/profile_image/'+req.params.size+"_"+data.image_id})
            }
        }else{
            res.json({success:false})
        }
    })
    .catch(err => {
        console.log(err)
        logger.error('Notification SQL Call Failed', {tags:['sql'], url:req.originalUrl, userId:jwtPayload.id, error:err.message || err, body:req.body});
        res.status(500).json({success:false, error:err})
    });
}

module.exports = router;