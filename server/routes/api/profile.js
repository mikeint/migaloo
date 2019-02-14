const express = require('express');
const router = express.Router();
const passport = require('../../config/passport');

//load input validation
const validateProfileInput = require('../../validation/profile');  

const postgresdb = require('../../config/db').postgresdb



// @route       GET api/profile/test
// @desc        Tests profile route
// @access      Public
router.get('/test', (req, res) => res.json({
    msg: "Profile Works"
}));
 

// @route       POST api/profile/saveType
// @desc        Add type to profile
// @access      Private
router.post('/saveType', passport.authentication,  (req, res) => {
    const { errors, isValid } = validateProfileInput(req.body);
    //check Validation
    if(!isValid) {
        return res.status(400).json(errors);
    }
    const body = req.body;
    var currentType = body.jwtPayload.userType;
    if(currentType || (currentType > 0 && currentType < 2)){
        errors.type = "Type already exists"
        return res.status(400).json(errors);
    }
    console.log(body)
    var type = body.type;
    var jwtPayload = body.jwtPayload;
    jwtPayload.userType = type;
    db.tx(t => {
        // creating a sequence of transaction queries:
        const q1 = t.none('UPDATE SET user_type_id $1 ON TABLE login WHERE user_id = $2', [type, jwtPayload.id]);
        var q2;
        if(type == 1){ // Recruiter
            q2 = t.none('INSERT INTO recruiter (recruiter_id, given_name, family_name, phone_number, coins, address_id) VALUES ($1, $2, $3, $4, $5, $6)',
                    [jwtPayload.id, body.givenName, body.familyName, body.phoneNumber, null, null])
        }else if(type == 2){ // Employer
            q2 = t.none('INSERT INTO employer (employer_id, contact_given_name, contact_family_name, contact_phone_number, company_name, address_id) VALUES ($1, $2, $3, $4, $5, $6)',
                    [jwtPayload.id, body.givenName, body.familyName, body.phoneNumber, body.companyName, null])
        }
        // returning a promise that determines a successful transaction:
        return t.batch([q1, q2]); // all of the queries are to be resolved;
    })
    .then(() => {
        // Remake jwt payload with the user type
        passport.signToken(jwtPayload).then((token)=>{
            res.json({
                success: true, 
                token: 'Bearer ' + token
            })
        }, (err)=>{
            res.status(400).json(err)
        })
    })
    .catch(err => {
        res.status(400).json(err)
    });
});



// @route       GET api/profile/:id
// @desc        get profile by ID
// @access      Private
router.get('/:id', passport.authentication,  (req, res) => {
    Profile.findOne({ user_id: req.params.id }).then(profile => { 
        return res.json(profile)
    }); 
});




module.exports = router;