const express = require('express');
const router = express.Router();
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const passport = require('../../config/passport');

const postgresdb = require('../../config/db').postgresdb;

//load input validation
const validateRegisterInput = require('../../validation/register'); 
const validateLoginInput = require('../../validation/login');
function createJWT(userId, email, type){
    return new Promise((resolve, reject)=>{
        //create jwt payload
        const payload = {
            id: userId,
            userType: type,
            email: email
        }
        //make JWT token (sign token) (payload obj, secretKey, expires obj) 
        passport.signToken(payload).then((token)=>{
            resolve({
                success: true, 
                token: 'Bearer ' + token
            })
        }, (err)=>{
            reject(err)
        })
    })
}
// @route       GET api/user/login
// @desc        Login user route
// @access      Public
router.post('/login', (req, res) => {
    console.log(req.body.email, req.body.password)
    const { errors, isValid } = validateLoginInput(req.body);
    // Check Validation 
    if (!isValid) {
        return res.status(400).json(errors);
    }

    const email = req.body.email;
    const password = req.body.password;
    postgresdb.one('SELECT user_id, passwordhash, user_type_id FROM login WHERE email = $1', email).then(user => {
        console.log(user)
        if (!user) {
            errors.email = 'Email not registered';
            console.log('Email not registered');
            return res.status(400).json(errors);
        } else {
            bcrypt.compare(password, user.passwordhash).then(isMatch => {
                if(isMatch) {
                    createJWT(user.user_id, email, user.user_type_id).then((token)=>{
                        res.status(200).json(token)
                    })
                    .catch(err => {
                        console.log(err)
                        res.status(400).json({success: false, error:err})
                    });
                } else {
                    errors.password = "Password Incorrect";
                    return res.status(400).json(errors)
                }
            });
 
        }
    });
});

function checkEmailExists(email){
    return new Promise((resolve, reject)=>{
        postgresdb.any('SELECT user_id FROM login WHERE email = $1', email).then(user => {
            if(user.length > 0 && user[0].user_id)
                resolve(user)
            else
                resolve()
        });
    })
}

// @route       GET api/user/register
// @desc        Register route
// @access      Public
router.post('/register', (req, res) => {
    var body = req.body;
    console.log(body)
    const { errors, isValid } = validateRegisterInput(body);
    // Check Validation 
    if (!isValid) {
        return res.status(400).json(errors);
    }
    checkEmailExists(body.email).then(user => {
        if (user) {  
            console.log('Email already exists');
            errors.email = 'Email already exists';
            return res.status(400).json(errors);
        } else {
            bcrypt.hash(body.password, 10).then((hash)=>{
                var type = body.type;
                postgresdb.tx(t => {
                    // creating a sequence of transaction queries:
                    const q1 = t.one('INSERT INTO login (email, passwordhash, user_type_id) VALUES ($1, $2, $3) RETURNING user_id',
                                    [body.email, hash, type]);
                    return q1.then((login_ret)=>{
                        console.log(login_ret)
                        var q2;
                        if(type == 1){ // Recruiter
                            q2 = t.none('INSERT INTO recruiter (recruiter_id, first_name, last_name, phone_number, address_id) VALUES ($1, $2, $3, $4, $5)',
                                    [login_ret.user_id, body.firstName, body.lastName, body.phoneNumber, null])
                        }else if(type == 2){ // Employer
                            q2 = t.none('INSERT INTO employer (employer_id, contact_first_name, contact_last_name, contact_phone_number, company_name, address_id) VALUES ($1, $2, $3, $4, $5, $6)',
                                    [login_ret.user_id, body.firstName, body.lastName, body.phoneNumber, body.companyName, null])
                        }
                        return q2
                            .then(() => {
                                createJWT(login_ret.user_id, body.email, type).then((token)=>{
                                    res.status(200).json(token)
                                })
                                .catch(err => {
                                    console.log(err)
                                    res.status(400).json({success: false, error:err})
                                });
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
            }, (err)=>{
                console.log(err)
                return res.status(500).json({success: false, error:err})
            })
        }
    }).catch((err)=>{
        console.log(err)
        return res.status(500).json({success: false, error:err})
    });
});

// @route       GET api/user/current
// @desc        return current user
// @access      Private3
router.get('/current', passport.authentication, (req, res) => {
    const avatar = gravatar.url(req.body.jwtPayload.user_id, {
        s: '200', // Size
        r: 'pg', // Rating
        d: 'mm' // Default
    });
    res.json({ 
        id: req.body.jwtPayload.id,
        name: req.body.jwtPayload.name,
        email: req.body.jwtPayload.email,
        avatar: avatar
    })
});


module.exports = router;