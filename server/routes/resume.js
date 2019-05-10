const express = require('express');
const router = express.Router();
const passport = require('../config/passport');
const logger = require('../utils/logging');

const postgresdb = require('../config/db').postgresdb
const generateUploadMiddleware = require('../utils/upload').generateUploadMiddleware
const upload = generateUploadMiddleware('resumes/')
const useAWS = process.env.AWS ? true : false;
const aws = require('aws-sdk');
const s3 = new aws.S3()

const generateResumeFileNameAndValidation = (req, res, next) => {
    // Validate this candidate is with this recruiter
    var jwtPayload = req.body.jwtPayload;
    if(jwtPayload.userType != 1){
        const errorMessage = "Invalid User Type"
        logger.error('Route Params Mismatch', {tags:['validation'], url:req.originalUrl, userId:jwtPayload.id, body: req.body, error:errorMessage});
        return res.status(400).json({success:false, error:errorMessage})
    }
    postgresdb.one('\
        SELECT 1 \
        FROM recruiter_candidate r \
        WHERE r.recruiter_id = $1 AND r.candidate_id = $2', [jwtPayload.id, req.params.candidateId])
    .then(() => {
        var now = Date.now()
        req.params.fileName = req.params.candidateId+"_resume_"+now.toString()
        next()
    })
    .catch(err => {
        console.log(err)
        res.status(500).json({success:false, error:err})
    });
}
/**
 * Upload resumes
 * @route GET api/resume/upload
 * @group resume - Resume
 * @param {Object} body.optional
 * @returns {object} 200 - A map of profile information
 * @returns {Error}  default - Unexpected error
 * @access Private
 */
router.post('/upload/:candidateId', passport.authentication, generateResumeFileNameAndValidation, upload.single('filepond'), (req, res) => {
    postgresdb.none('UPDATE candidate SET resume_id=$1 WHERE candidate_id = $2', [req.params.finalFileName, req.params.candidateId])
    .then((data) => {
        res.json({success:true, resume_id:req.params.finalFileName})
    })
    .catch(err => {
        logger.error('Resume SQL Call Failed', {tags:['sql'], url:req.originalUrl, userId:jwtPayload.id, error:err.message || err, body:req.body});
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
router.get('/view/:candidateId', passport.authentication,  generateResumeFileNameAndValidation, (req, res) => {
    postgresdb.one('\
        SELECT resume_id \
        FROM candidate c \
        WHERE c.candidate_id = $1', [req.params.candidateId])
    .then((data) => {
        if(useAWS){
            var params = {Bucket: bucketName, Key: 'resumes/'+data.resume_id};
            s3.getSignedUrl('getObject', params, function (err, url) {
                if(err != null){
                    logger.error('Signed URL Call Failed', {tags:['aws', 's3'], url:req.originalUrl, userId:jwtPayload.id, error:err, body:req.body});
                    return res.status(500).json({success:false, error:err})
                }
                res.json({success:true, url:url})
            });
        }else{
            res.json({success:true, url:'http://localhost:5000/api/public/resumes/'+data.resume_id})
        }
    })
    .catch(err => {
        logger.error('Resume SQL Call Failed', {tags:['sql'], url:req.originalUrl, userId:jwtPayload.id, error:err.message || err, body:req.body});
        res.status(500).json({success:false, error:err})
    });
});




module.exports = router;