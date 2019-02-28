const express = require('express');
const router = express.Router();
const passport = require('../../config/passport');
const db = require('../../config/db')
const postgresdb = db.postgresdb
const useAWS = process.env.AWS ? true : false;

/**
 * Get image
 * @route GET api/profileImage/view
 * @group profileImage - Profile Image
 * @param {Object} body.optional
 * @returns {object} 200 - A map of profile information
 * @returns {Error}  default - Unexpected error
 * @access Private
 */
router.get('/view/:size', passport.authentication, (req, res) => {
    if(req.params.size == null)
        return res.status(400).json({success:false, error:"Missing Size"})
    var jwtPayload = req.body.jwtPayload;
    var query;
    if(jwtPayload.userType == 1){
        query = '\
        SELECT image_id \
        FROM recruiter r \
        WHERE r.recruiter_id = $1'
    }else if(jwtPayload.userType == 2){
        query = '\
        SELECT image_id \
        FROM employer r \
        WHERE r.employer_id = $1'
    }else if(jwtPayload.userType == 3){
        query = '\
        SELECT image_id \
        FROM candidate r \
        WHERE r.candidate_id = $1'
    }
    postgresdb.one(query, [jwtPayload.id])
    .then((data) => {
        if(data.image_id != null){
            if(useAWS){
                var params = {Bucket: bucketName, Key: 'profile_image/'+req.params.size+"_"+data.image_id};
                s3.getSignedUrl('getObject', params, function (err, url) {
                    if(err != null)
                        return res.status(400).json(err)
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
        res.status(400).json(err)
    });
});
/**
 * Get any image
 * @route GET api/profileImage/view
 * @group profileImage - Profile Image
 * @param {Object} body.optional
 * @returns {object} 200 - A map of profile information
 * @returns {Error}  default - Unexpected error
 * @access Private
 */
router.get('/view/:type/:id/:size', passport.authentication, (req, res) => {
    if(req.params.type == null)
        return res.status(400).json({success:false, error:"Missing Type"})
    if(req.params.id == null)
        return res.status(400).json({success:false, error:"Missing Id"})
    if(req.params.size == null)
        return res.status(400).json({success:false, error:"Missing Size"})
    var query;
    if(req.params.type == 1){
        query = '\
            SELECT image_id \
            FROM recruiter r \
            WHERE r.recruiter_id = $1'
    }else if(req.params.type == 2){
        query = '\
            SELECT image_id \
            FROM employer_contact r \
            WHERE r.employer_contact_id = $1'
    }else if(req.params.type == 3){
        query = '\
            SELECT image_id \
            FROM candidate r \
            WHERE r.candidate_id = $1'
    }
    postgresdb.one(query, [req.params.id])
    .then((data) => {
        if(data.image_id != null){
            if(useAWS){
                var params = {Bucket: bucketName, Key: 'profile_image/'+req.params.size+"_"+data.image_id};
                s3.getSignedUrl('getObject', params, function (err, url) {
                    if(err != null)
                        return res.status(400).json(err)
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
        res.status(400).json(err)
    });
});




module.exports = router;