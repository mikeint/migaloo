const express = require('express');
const router = express.Router();
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const passport = require('../../config/passport');

const postgresdb = require('../../config/db').postgresdb;

//load input validation
const validateRegisterInput = require('../../validation/register'); 
const validateLoginInput = require('../../validation/login');

function getHash(password){
    return new Promise((resolve, reject)=>{
        bcrypt.genSalt(10, (err, salt) => {
            if(err)
                return reject(err)
            bcrypt.hash(password, salt, (err, hash) => {
                if(err)
                    return reject(err)
                resolve(hash)
            });
        });
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
                    //create jwt payload
                    const payload = {
                        id: user.user_id,
                        name: user.name,
                        userType: user.user_type_id,
                        email: email
                    }
                    //make JWT token (sign token) (payload obj, secretKey, expires obj) 
                    passport.signToken(payload).then((token)=>{
                        res.json({
                            success: true, 
                            token: 'Bearer ' + token
                        })
                    }, (err)=>{
                        res.status(400).json(err)
                    })

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
        postgresdb.one('SELECT user_id FROM login WHERE email = $1', email).then(user => {
            if(user && user.user_id)
                resolve(user)
            else
                resolve()
        });
    })
}

// @route       GET api/user/register
// @desc        Register user route
// @access      Public
router.post('/register', (req, res) => {
    const { errors, isValid } = validateRegisterInput(req.body);
    // Check Validation 
    if (!isValid) {
        return res.status(400).json(errors);
    }
    checkEmailExists(req.body.email).then(user => {
        if (user) {  
            console.log('Email already exists');
            errors.email = 'Email already exists';
            return res.status(400).json(errors);
        } else {
            getHash(newUser.password).then((hash)=>{
                postgresdb.none('INSERT INTO login (email, passwordhash) VALUES ($1, $2)', [req.body.email, hash]).then(()=>{
                    console.log("**********USER ADDED")
                    return res.status(200).json({success:true});
                })
            }, (err)=>{
                return res.status(500).json(err)
            })
        }
    });
});


// @route       GET api/user/current
// @desc        return current user
// @access      Private3
router.get('/current', passport.authenticate, (req, res) => {
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