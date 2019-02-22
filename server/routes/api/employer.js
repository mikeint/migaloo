const express = require('express');
const router = express.Router();
const passport = require('../../config/passport');
const moment = require('moment');

//load input validation
const validateEmployerInput = require('../../validation/employer');  

const postgresdb = require('../../config/db').postgresdb
const generateUploadMiddleware = require('../upload').generateUploadMiddleware
const upload = generateUploadMiddleware('profile_image/')

const generateImageFileNameAndValidation = (req, res, next) => {
    // Validate this candidate is with this recruiter
    var jwtPayload = req.body.jwtPayload;
    if(jwtPayload.userType != 2){
        return res.status(400).json({success:false, error:"Must be an employer for this"})
    }
    var now = Date.now()
    req.params.fileName = jwtPayload.id+"_image_"+now.toString()
    req.params.jwtPayload = jwtPayload
    next()
}

/**
 * Upload recruiter profile image
 * @route GET api/recruiter/uploadImage
 * @group employer - Recruiter
 * @param {Object} body.optional
 * @returns {object} 200 - A map of profile information
 * @returns {Error}  default - Unexpected error
 * @access Private
 */
router.post('/uploadImage', passport.authentication, generateImageFileNameAndValidation, upload.any('filepond'), (req, res) => {
    var jwtPayload = req.params.jwtPayload;
    postgresdb.none('UPDATE employer SET image_id=$1 WHERE employer_id = $2', [req.params.finalFileName, jwtPayload.id])
    .then((data) => {
        res.json({success:true, image_id:req.params.finalFileName})
    })
    .catch(err => {
        console.log(err)
        res.status(400).json(err)
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
        return res.status(400).json({success:false, error:"Must be an employer for this"})
    }
    
    postgresdb.one('\
        SELECT email, contact_first_name, contact_last_name, \
            contact_phone_number, company_name, image_id, \
            street_address_1, street_address_2, city, state, country \
        FROM employer e \
        INNER JOIN login l ON l.user_id = e.employer_id \
        LEFT JOIN address a ON a.address_id = e.address_id \
        WHERE e.employer_id = $1', [jwtPayload.id])
    .then((data) => {
        res.json(data)
    })
    .catch(err => {
        console.log(err)
        res.status(400).json(err)
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
        return res.status(400).json(errors);
    }
    var bodyData = req.body;
    var jwtPayload = bodyData.jwtPayload;
    if(jwtPayload.userType != 2){
        return res.status(400).json({success:false, error:"Must be an employer for this"})
    }
    var fields = ['contact_first_name', 'contact_last_name', 'contact_phone_number', 'company_name'];
    var addressFields = ['street_address_1', 'street_address_2', 'city', 'state', 'country'];
    postgresdb.one('SELECT contact_first_name, contact_last_name, contact_phone_number, company_name, e.address_id, street_address_1, street_address_2, city, state, country \
                    FROM employer e \
                    LEFT JOIN address a ON e.address_id = a.address_id\
                    WHERE employer_id = $1', [jwtPayload.id]).then((data)=>{
        var addressId = data.address_id;
        var addressIdExists = (data.address_id != null);
        var fieldUpdates = fields.map(f=> bodyData[f] != null?bodyData[f]:data[f]);
        var addrFieldUpdates = addressFields.map(f=> bodyData[f] != null?bodyData[f]:data[f]);
        postgresdb.tx(t => {
            // creating a sequence of transaction queries:
            var q1
            if(!addressIdExists){
                q1 = t.one('INSERT INTO address (street_address_1, street_address_2, city, state, country) VALUES ($1, $2, $3, $4, $5) RETURNING address_id',
                                [...addrFieldUpdates])
            }else{
                q1 = t.none('UPDATE address SET street_address_1=$1, street_address_2=$2, city=$3, state=$4, country=$5 WHERE address_id = $6',
                                [...addrFieldUpdates, addressId]);
            }
            return q1.then((addr_ret)=>{
                addressId = addressIdExists ? addressId : addr_ret.address_id
                const q2 = t.none('UPDATE employer SET contact_first_name=$1, contact_last_name=$2, contact_phone_number=$3, company_name=$4, address_id=$5 WHERE employer_id = $6',
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
 * Get employer alerts
 * @route GET api/employer/alerts
 * @group employer - Employer
 * @param {Object} body.optional
 * @returns {object} 200 - A list of alert information
 * @returns {Error}  default - Unexpected error
 * @access Private
 */
router.get('/alerts', passport.authentication,  (req, res) => {
    var jwtPayload = req.body.jwtPayload;
    if(jwtPayload.userType != 2){
        return res.status(400).json({success:false, error:"Must be an employer for this"})
    }
    
    postgresdb.any('\
        SELECT c.candidate_id, jp.post_id, cp.created_on, c.first_name, coins, alert_count, jp.title \
        FROM candidate_posting cp \
        INNER JOIN job_posting jp ON cp.post_id = jp.post_id \
        INNER JOIN candidate c ON c.candidate_id = cp.candidate_id \
        LEFT JOIN (\
            SELECT employer_id, count(1) as alert_count \
            FROM candidate_posting cpi \
            INNER JOIN job_posting jpi ON cpi.post_id = jpi.post_id \
            WHERE NOT cpi.has_seen_post AND jpi.employer_id = $1 \
            GROUP BY jpi.employer_id\
        ) t ON t.employer_id = jp.employer_id\
        WHERE NOT cp.has_seen_post AND jp.employer_id = $1 \
        ORDER BY created_on DESC \
        LIMIT 10', [jwtPayload.id])
    .then((data) => {
        // Marshal data
        data = data.map(m=>{
            var timestamp = moment(m.created_on);
            var ms = timestamp.diff(moment());
            m.created = moment.duration(ms).humanize() + " ago";
            m.created_on = timestamp.format("x");
            return m
        })
        res.json({success:true, alertList:data})
    })
    .catch(err => {
        console.log(err)
        res.status(400).json(err)
    });
});


module.exports = router;