const express = require('express');
const router = express.Router();
const passport = require('../utils/passport');
const logger = require('../utils/logging');

const db = require('../utils/db')
const postgresdb = db.postgresdb
const pgp = db.pgp

const upload = require('../utils/upload')
const uploadMiddleware = upload.generateUploadMiddleware('resumes/')

const useAWS = process.env.AWS ? true : false;
const aws = require('aws-sdk');
const s3 = new aws.S3()
const bucketName = require('../config/settings').s3.bucketName;

const generateResumeFileNameAndValidation = (req, res, next) => {
    // Validate this candidate is with this recruiter
    var jwtPayload = req.body.jwtPayload;
    if(jwtPayload.userType != 1){
        const errorMessage = "Invalid User Type"
        logger.error('Route Params Mismatch', {tags:['validation'], url:req.originalUrl, userId:jwtPayload.id, body: req.body, params: req.params, error:errorMessage});
        return res.status(400).json({success:false, error:errorMessage})
    }
    postgresdb.one('\
        SELECT 1 \
        FROM recruiter_candidate r \
        WHERE r.recruiter_id = $1 AND r.candidate_id = $2', [jwtPayload.id, req.params.candidateId])
    .then(() => {
        upload.getFileId(jwtPayload.id, 2)
        .then((file_id) => {
            req.params.fileId = file_id.file_id
            req.params.fileName = file_id.file_id+"_resume"
            next()
        })
        .catch(err => {
            console.log(err)
            res.status(500).json({success:false, error:err})
        });
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
router.post('/upload/:candidateId?', passport.authentication, generateResumeFileNameAndValidation, uploadMiddleware.single('filepond'), (req, res) => {
    const jwtPayload = req.params.jwtPayload;
    const resumeId = req.params.fileId;
    logger.info('Uploaded Resume', {tags:['upload', 'resume'], url:req.originalUrl, userId:jwtPayload.id, body:req.body, params:req.params})
    if(req.params.candidateId == null){
        res.json({success:true, resumeId:resumeId})
    }else{
        return postgresdb.none('UPDATE candidate SET resume_id=$1 WHERE candidate_id = $2',
            [resumeId, req.params.candidateId])
        .then(() => {
            res.json({success:true, resumeId:resumeId})
        })
        .catch(err => {
            logger.error('Resume SQL Call Failed', {tags:['sql'], url:req.originalUrl, userId:jwtPayload.id, error:err.message || err, body:req.body});
            res.status(500).json({success:false, error:err})
        });
    }
});
/**
 * Get candidate resume
 * @route GET api/resume/view
 * @group resume - Resume
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