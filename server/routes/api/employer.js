const express = require('express');
const router = express.Router();
const passport = require('../../config/passport');

//load input validation
const validateEmployerInput = require('../../validation/employer');  

const postgresdb = require('../../config/db').postgresdb
 

// @route       POST api/employer/getProfile
// @desc        Get employer profile
// @access      Private
router.get('/getProfile', passport.authentication,  (req, res) => {
    var jwtPayload = req.body.jwtPayload;
    if(jwtPayload.userType != 2){
        return res.status(400).json({success:false, error:"Must be an employer to look at postings"})
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

router.post('/setProfile', passport.authentication,  (req, res) => {
    const { errors, isValid } = validateEmployerInput(req.body);
    //check Validation
    if(!isValid) {
        return res.status(400).json(errors);
    }
    var bodyData = req.body;
    var jwtPayload = bodyData.jwtPayload;
    if(jwtPayload.userType != 2){
        return res.status(400).json({success:false, error:"Must be an employer to look at postings"})
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
        console.log("fieldUpdates", fieldUpdates)
        console.log("addrFieldUpdates", addrFieldUpdates)
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
            console.log("addressId old", addressId)
            return q1.then((addr_ret)=>{
                console.log(addr_ret)
                addressId = addressIdExists ? addressId : addr_ret.address_id
                console.log("addressId", addressId)
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




module.exports = router;