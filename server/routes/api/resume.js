const express = require('express');
const router = express.Router();
const passport = require('../../config/passport');

const postgresdb = require('../../config/db').postgresdb
var aws = require('aws-sdk')
var s3 = new aws.S3()

var multer  = require('multer')
var multerS3  = require('multer-s3')
const bucketName = 'hireranked-data'
const MIME_TYPE_MAP = {
    'application/x-pdf':'pdf',
    'application/pdf':'pdf',
    'application/msword':'doc',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document':'docx',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.template':'docx'
}
const useAWS = process.env.AWS ? true : false;
var upload = (useAWS ? 
    multer({
        storage: multerS3({
                s3: s3,
                bucket: bucketName,
            metadata: function (req, file, cb) {
                console.log(file)
                cb(null, {fieldName: file.fieldname});
            },
            key: function (req, file, cb) {
                const ext = MIME_TYPE_MAP[file.mimetype]
                req.params.finalFileName = `${req.params.fileName}.${ext}`
                cb(null,  "resumes/"+req.params.finalFileName)
            }
        })
    })
    :
    multer({ 
        storage: multer.diskStorage({
            destination: (req, file, callback) => {
                callback(null, 'public/resumes/')
            },
            filename: (req, file, callback) => {
                const ext = MIME_TYPE_MAP[file.mimetype]
                req.params.finalFileName = `${req.params.fileName}.${ext}`
                callback(null, req.params.finalFileName)
            }
        })
    })
)
const recruiterCandidateValidation = (req, res, next) => {
    // Validate this candidate is with this recruiter
    var jwtPayload = req.body.jwtPayload;
    if(jwtPayload.userType != 1){
        return res.status(400).json({success:false, error:"Must be an recruiter for this"})
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
        res.status(400).json(err)
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
router.post('/upload/:candidateId', passport.authentication, recruiterCandidateValidation, upload.single('filepond'), (req, res) => {
    console.log(req.body)
    console.log(req.params)
    postgresdb.none('UPDATE candidate SET resume_id=$1 WHERE candidate_id = $2', [req.params.finalFileName, req.params.candidateId])
    .then((data) => {
        res.json({success:true, resume_id:req.params.finalFileName})
    })
    .catch(err => {
        console.log(err)
        res.status(400).json(err)
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
router.get('/view/:candidateId', passport.authentication,  recruiterCandidateValidation, (req, res) => {
    postgresdb.one('\
        SELECT resume_id \
        FROM candidate c \
        WHERE c.candidate_id = $1', [req.params.candidateId])
    .then((data) => {
        if(useAWS){
            var params = {Bucket: bucketName, Key: 'resumes/'+data.resume_id};
            var url = s3.getSignedUrl('getObject', params);
            res.json({success:true, url:url})
        }else{
            res.json({success:true, url:'http://localhost:5000/api/public/resumes/'+data.resume_id})
        }
    })
    .catch(err => {
        console.log(err)
        res.status(400).json(err)
    });
});




module.exports = router;