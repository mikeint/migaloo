const express = require('express');
const router = express.Router();
const passport = require('../../config/passport');
const db = require('../../config/db')
const postgresdb = db.postgresdb
const useAWS = process.env.AWS ? true : false;

/**
 * Get recruiter profile information
 * @route GET api/profileImage/view
 * @group profileImage - Profile Image
 * @param {Object} body.optional
 * @returns {object} 200 - A map of profile information
 * @returns {Error}  default - Unexpected error
 * @access Private
 */
router.get('/view/:size', passport.authentication, (req, res) => {
    var jwtPayload = req.body.jwtPayload;
    postgresdb.one('\
        SELECT image_id \
        FROM recruiter r \
        WHERE r.recruiter_id = $1', [jwtPayload.id])
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