const express = require('express');
const router = express.Router();
const passport = require('../../config/passport');

//load input validation
const validateEmployerInput = require('../../validation/recruiter');  

const postgresdb = require('../../config/db').postgresdb
 

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
        return res.status(400).json({success:false, error:"Must be an recruiter for this"})
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
        return res.status(400).json({success:false, error:"Must be an recruiter for this"})
    }
    
    postgresdb.one('\
        SELECT email, first_name, last_name, \
            phone_number, image_id, \
            street_address_1, street_address_2, city, state, country, coins \
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
        return res.status(400).json({success:false, error:"Must be an recruiter for this"})
    }
    var fields = ['first_name', 'last_name', 'phone_number'];
    var addressFields = ['street_address_1', 'street_address_2', 'city', 'state', 'country'];
    postgresdb.one('SELECT first_name, last_name, phone_number, r.address_id, street_address_1, street_address_2, city, state, country \
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
                q1 = t.one('INSERT INTO address (street_address_1, street_address_2, city, state, country) VALUES ($1, $2, $3, $4, $5) RETURNING address_id',
                                [...addrFieldUpdates])
            }else{
                q1 = t.none('UPDATE address SET street_address_1=$1, street_address_2=$2, city=$3, state=$4, country=$5 WHERE address_id = $6',
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




module.exports = router;