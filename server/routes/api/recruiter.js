const express = require('express');
const router = express.Router();
const passport = require('../../config/passport');
const moment = require('moment');

//load input validation
const validateEmployerInput = require('../../validation/recruiter');  

const postgresdb = require('../../config/db').postgresdb
const generateUploadMiddleware = require('../upload').generateUploadMiddleware
const upload = generateUploadMiddleware('profile_image/')

const generateImageFileNameAndValidation = (req, res, next) => {
    // Validate this candidate is with this recruiter
    var jwtPayload = req.body.jwtPayload;
    if(jwtPayload.userType != 1){
        return res.status(400).json({success:false, error:"Must be a recruiter for this"})
    }
    var now = Date.now()
    req.params.fileName = jwtPayload.id+"_image_"+now.toString()
    req.params.jwtPayload = jwtPayload
    next()
}

/**
 * Upload recruiter profile image
 * @route GET api/recruiter/uploadImage
 * @group recruiter - Recruiter
 * @param {Object} body.optional
 * @returns {object} 200 - A map of profile information
 * @returns {Error}  default - Unexpected error
 * @access Private
 */
router.post('/uploadImage', passport.authentication, generateImageFileNameAndValidation, upload.any('filepond'), (req, res) => {
    var jwtPayload = req.params.jwtPayload;
    postgresdb.none('UPDATE recruiter SET image_id=$1 WHERE recruiter_id = $2', [req.params.finalFileName, jwtPayload.id])
    .then((data) => {
        res.json({success:true, image_id:req.params.finalFileName})
    })
    .catch(err => {
        console.log(err)
        res.status(400).json(err)
    });
});

/**
 * Get recruiter coins
 * @route GET api/recruiter/getCoins
 * @group recruiter - Recruiter
 * @param {Object} body.optional
 * @returns {object} 200 - A map of profile information
 * @returns {Error}  default - Unexpected error
 * @access Private
 */
router.get('/getCoins', passport.authentication,  (req, res) => {
    var jwtPayload = req.body.jwtPayload;
    if(jwtPayload.userType != 1){
        return res.status(400).json({success:false, error:"Must be a recruiter for this"})
    }
    
    postgresdb.one('\
        SELECT coins \
        FROM recruiter r \
        WHERE r.recruiter_id = $1', [jwtPayload.id])
    .then((data) => {
        res.json(data)
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
router.get('/getProfile', passport.authentication,  (req, res) => {
    var jwtPayload = req.body.jwtPayload;
    if(jwtPayload.userType != 1){
        return res.status(400).json({success:false, error:"Must be a recruiter for this"})
    }
    
    postgresdb.one('\
        SELECT email, first_name, last_name, \
            phone_number, image_id, \
            address_line_1, address_line_2, city, state, country, coins \
        FROM recruiter r \
        INNER JOIN login l ON l.user_id = r.recruiter_id \
        LEFT JOIN address a ON a.address_id = r.address_id \
        WHERE r.recruiter_id = $1', [jwtPayload.id])
    .then((data) => {
        res.json(data)
    })
    .catch(err => {
        console.log(err)
        res.status(400).json(err)
    });
});

/**
 * Set recruiter profile information
 * @route POST api/recruiter/setProfile
 * @group recruiter - Recruiter
 * @param {Object} body.optional
 * @returns {object} 200
 * @returns {Error}  default - Unexpected error
 * @access Private
 */
router.post('/setProfile', passport.authentication,  (req, res) => {
    const { errors, isValid } = validateEmployerInput(req.body);
    //check Validation
    if(!isValid) {
        return res.status(400).json(errors);
    }
    var bodyData = req.body;
    var jwtPayload = bodyData.jwtPayload;
    if(jwtPayload.userType != 1){
        return res.status(400).json({success:false, error:"Must be a recruiter for this"})
    }
    var fields = ['first_name', 'last_name', 'phone_number'];
    var addressFields = ['address_line_1', 'address_line_2', 'city', 'state', 'country'];
    postgresdb.one('SELECT first_name, last_name, phone_number, r.address_id, address_line_1, address_line_2, city, state, country \
                    FROM recruiter r \
                    LEFT JOIN address a ON r.address_id = a.address_id\
                    WHERE recruiter_id = $1', [jwtPayload.id]).then((data)=>{
        var addressId = data.address_id;
        var addressIdExists = (data.address_id != null);
        var fieldUpdates = fields.map(f=> bodyData[f] != null?bodyData[f]:data[f]);
        var addrFieldUpdates = addressFields.map(f=> bodyData[f] != null?bodyData[f]:data[f]);
        postgresdb.tx(t => {
            // creating a sequence of transaction queries:
            var q1
            if(!addressIdExists){
                q1 = t.one('INSERT INTO address (address_line_1, address_line_2, city, state, country) VALUES ($1, $2, $3, $4, $5) RETURNING address_id',
                                [...addrFieldUpdates])
            }else{
                q1 = t.none('UPDATE address SET address_line_1=$1, address_line_2=$2, city=$3, state=$4, country=$5 WHERE address_id = $6',
                                [...addrFieldUpdates, addressId]);
            }
            return q1.then((addr_ret)=>{
                addressId = addressIdExists ? addressId : addr_ret.address_id
                const q2 = t.none('UPDATE recruiter SET first_name=$1, last_name=$2, phone_number=$3, company_name=$4, address_id=$5 WHERE recruiter_id = $6',
                                [...fieldUpdates, addressId, jwtPayload.id]);
                return q2
                    .then(() => {
                        res.status(200).json({success: true})
                        return []
                    })
                    .catch(err => {
                        console.log(err)
                        res.status(400).json({success: false, error:err})
                    });
            })
            .catch(err => {
                
                console.log(err)
                res.status(400).json({success: false, error:err})
            });
        })
        .then(() => {
            console.log("Done TX")
        }).catch((err)=>{
            console.log(err)
            return res.status(500).json({success: false, error:err})
        });
    })
});

/**
 * Get recruiter alerts
 * @route GET api/recruiter/alerts
 * @group recruiter - Recruiter
 * @param {Object} body.optional
 * @returns {object} 200 - A list of alert information
 * @returns {Error}  default - Unexpected error
 * @access Private
 */
router.get('/alerts', passport.authentication,  (req, res) => {
    var jwtPayload = req.body.jwtPayload;
    if(jwtPayload.userType != 1){
        return res.status(400).json({success:false, error:"Must be a recruiter for this"})
    }
    
    postgresdb.any('\
        SELECT cp.candidate_id, post_id, migaloo_accepted, migaloo_responded_on, coins, alert_count, c.first_name, c.last_name \
        FROM candidate_posting cp \
        LEFT JOIN (SELECT recruiter_id, count(1) as alert_count \
            FROM candidate_posting cpi \
            WHERE migaloo_responded_on IS NOT NULL AND NOT has_seen_response AND cpi.recruiter_id = $1 \
            GROUP BY cpi.recruiter_id \
        ) t ON t.recruiter_id = cp.recruiter_id \
        INNER JOIN candidate c ON c.candidate_id = cp.candidate_id \
        WHERE migaloo_responded_on IS NOT NULL AND NOT has_seen_response AND cp.recruiter_id = $1 \
        ORDER BY migaloo_responded_on DESC \
        LIMIT 10', [jwtPayload.id])
    .then((data) => {
        // Marshal data
        data = data.map(m=>{
            var timestamp = moment(m.migaloo_responded_on);
            var ms = timestamp.diff(moment());
            m.responded = moment.duration(ms).humanize() + " ago";
            m.migaloo_responded_on = timestamp.format("x");
            return m
        })
        res.json({success:true, alertList:data})
    })
    .catch(err => {
        console.log(err)
        res.status(400).json(err)
    });
});

// @route       GET api/recruiter/setRead/:postId/:candidateId
// @desc        Set posting to be read
// @access      Private
router.post('/setRead/:postId/:candidateId', passport.authentication,  (req, res) => {
    var jwtPayload = req.body.jwtPayload;
    var postId = req.params.postId
    var candidateId = req.params.candidateId
    if(jwtPayload.userType != 1){
        return res.status(400).json({success:false, error:"Must be a recruiter to look at postings"})
    }
    if(postId == null){
        return res.status(400).json({success:false, error:"Missing Post Id"})
    }
    if(candidateId == null){
        return res.status(400).json({success:false, error:"Missing Candidate Id"})
    }
    postgresdb.none('UPDATE candidate_posting SET has_seen_response=true WHERE cp.recruiter_id = $1 AND cp.candidate_id = $2 AND cp.post_id = $3', [jwtPayload.id, candidateId, postId])
    .then((data) => {
        res.json({success:true})
    })
    .catch(err => {
        console.log(err)
        res.status(400).json(err)
    });
});
module.exports = router;