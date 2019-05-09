const express = require('express');
const router = express.Router();
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const passport = require('../config/passport');
const ses = require('../utils/ses');
const postingAssign = require('../utils/postingAssign');

const postgresdb = require('../config/db').postgresdb;

//load input validation
const validateRegisterInput = require('../validation/register'); 
const validateLoginInput = require('../validation/login');

// TODO: encrypt JWT with public key
function createJWT(payload){
    return new Promise((resolve, reject)=>{
        //create jwt payload
        //make JWT token (sign token) (payload obj, secretKey, expires obj) 
        passport.signToken(payload).then((token)=>{
            resolve({
                success: true, 
                token: 'Bearer ' + token,
                user:payload
            })
        }, (err)=>{
            reject(err)
        })
    })
}

router.post('/saml/callback', passport.passportObject.authenticate('saml', {
    failureRedirect: '/error',
    failureFlash: true
  }), function (req, res) {
    res.redirect('/')
  })
// @route       GET api/auth/login
// @desc        Login user route
// @access      Public
router.post('/login', (req, res) => {
    const { errors, isValid } = validateLoginInput(req.body);
    // Check Validation 
    if (!isValid) {
        return res.status(400).json(errors);
    }
    const loginIp = req.connection.remoteAddress;
    const email = req.body.email;
    // if(req.body.email.endsWith("@migaloo.io")){
    //     console.log("saml")
    //     passport.passportObject.authenticate('saml', { failureRedirect: '/', failureFlash: true }),
    //     function(req, res) {
    //         console.log("saml complete")
    //         res.redirect('/employer');
    //     }
    // }else{
    const password = req.body.password;
    postgresdb.one('SELECT l.user_id, l.passwordhash, l.user_type_id, um.user_type_name, um.is_primary, l.email_verified \
            FROM login l \
            INNER JOIN user_master um ON l.user_id = um.user_id \
            WHERE l.email = $1', email).then(user => {
        const payload = {
            id: user.user_id,
            userType: user.user_type_id,
            email: email,
            isPrimary: user.is_primary,
            isVerified: user.email_verified
        }
        if (!user) {
            errors.email = 'Email not registered';
            console.log('Email not registered');
            return res.status(400).json(errors);
        } else {
            bcrypt.compare(password, user.passwordhash).then(isMatch => {
                if(isMatch) {
                    postgresdb.none('INSERT INTO login_history (user_id, login_ip) VALUES ($1, $2)',
                            [user.user_id, loginIp]).then(()=>{})
                    createJWT(payload).then((token)=>{
                        console.log(`Successful login from ${loginIp} for ${email}`)
                        res.status(200).json(token)
                    })
                    .catch(err => {
                        console.log(err)
                        res.status(400).json({success: false, error:err})
                    });
                } else {
                    console.log(`Failed login from ${loginIp} for ${email}`)
                    errors.password = "Password Incorrect";
                    return res.status(400).json(errors)
                }
            });
    
        }
    })
    .catch(err => {
        console.log(err)
        res.status(500).json({success: false, error:err})
    });
    // }
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

// @route       GET api/auth/register
// @desc        Register route
// @access      Public
router.post('/register', (req, res) => { // Todo recieve encrypted jwt toekn for employer to join
    var body = req.body;
    console.log(body)
    const { errors, isValid } = validateRegisterInput(body);
    const loginIp = req.connection.remoteAddress;
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
                    const qc = t.one('INSERT INTO login (user_type_id) VALUES (4) RETURNING user_id', []);
                    return t.batch([q1, qc]).then((ret)=>{
                        const login_ret = ret[0];
                        const company_login_ret = ret[1];
                        const payload = {
                            id: login_ret.user_id,
                            userType: type,
                            email: body.email,
                            isPrimary: true,
                            isVerified: false
                        }
                        const lh = t.none('INSERT INTO login_history (user_id, login_ip) VALUES ($1, $2)',
                                [login_ret.user_id, loginIp])
                        if(type == 1){ // Recruiter
                            const q2 = t.none('INSERT INTO company (company_id, company_name, address_id) VALUES ($1, $2, $3)',
                                    [company_login_ret.user_id, body.companyName, null])
                            var q3 = t.none('INSERT INTO recruiter (recruiter_id, first_name, last_name, phone_number, address_id) VALUES ($1, $2, $3, $4, $5)',
                                    [login_ret.user_id, body.firstName, body.lastName, body.phoneNumber, null])
                            var q4 = t.none('INSERT INTO company_contact (company_contact_id, company_id, is_primary) VALUES ($1, $2, true)',
                                [login_ret.user_id, company_login_ret.user_id])
                            return t.batch([lh, q2, q3, q4]).then(() => {
                                sendEmailVerification(payload.id, payload.email) // Async to send email verification
                                .catch(err => {
                                    console.error(err)
                                })
                                createJWT(payload).then((token)=>{
                                    res.status(200).json(token)
                                })
                                .catch(err => {
                                    console.log(err)
                                    res.status(400).json({success: false, error:err})
                                });
                                return []
                            })
                        }else if(type == 2){ // Employer
                            var q2 = t.none('INSERT INTO company (company_id, company_name, address_id) VALUES ($1, $2, $3, $4, $5, $6)',
                                    [company_login_ret.user_id, body.companyName, null])
                            var q3 = t.none('INSERT INTO company_contact (company_contact_id, company_id, is_primary) VALUES ($1, $2, true)',
                                [login_ret.user_id, company_login_ret.user_id, body.firstName, body.lastName, body.phoneNumber])
                            return t.batch([lh, q2, q3]).then(() => {
                                sendEmailVerification(payload.id, payload.email) // Async to send email verification
                                .catch(err => {
                                    console.error(err)
                                })
                                createJWT(payload).then((token)=>{
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
                        }
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
// @route       POST api/auth/resetPassword
// @desc        Reset password route
// @access      Public
router.post('/resetPassword', (req, res) => { // Todo recieve encrypted jwt toekn for employer to join
    var body = req.body;
    passport.decodeToken(body.token).then(payload=>{
        bcrypt.hash(body.password, 10).then((hash)=>{
            postgresdb.none('UPDATE login SET passwordhash=${password} WHERE lower(email) = ${email}',
                            {email:payload.email, password: hash})
                .then(() => {
                    res.json({success:true})
                })
        })
    }).catch(err=>res.status(400).json(err))
});
router.post('/sendPasswordReset', (req, res) => { // Todo recieve encrypted jwt toekn for employer to join
    const email = req.body.email.trim();
    
    return postgresdb.one('\
        SELECT concat(first_name, \' \', last_name) as display_name, user_id \
        FROM user_master um \
        WHERE lower(um.email) = ${email}', {email:email})
    .then((data) => {
        console.log(data)
        ses.resetPasswordEmail({name:data.display_name, email:email})
        .then(result=>{
            console.log(result)
            res.json({success:true})
        })
    })
    .catch(err => {
        console.log(err)
        res.status(400).json(err)
    });
});
router.post('/verifyEmail', (req, res) => { // Todo recieve encrypted jwt toekn for employer to join
    var body = req.body;
    passport.decodeToken(body.token).then(payload=>{
        postgresdb.none('UPDATE login SET email_verified=true WHERE user_id = ${id}',
                        {id:payload.user_id})
            .then(() => {
                postingAssign.findPostsForNewRecruiter(payload.id).then((data)=>{
                    postingAssign.assignJobToRecruiter(data.map(d=> {return {post_id: d.post_id, recruiter_id: payload.id}}))
                    .then(() => {
                        res.json({success:true})
                    })
                    .catch(err => {
                        console.error(err)
                        res.status(400).json(err)
                    })
                }) // Async call to add posts to the new recruiter
                .catch(err => {
                    console.error(err)
                    res.status(400).json(err)
                })
            })
            .catch(err=>res.status(400).json(err))
    }).catch(err=>res.status(400).json(err))
});
function sendEmailVerification(id, email){
    return new Promise((resolve, reject)=>{
        return postgresdb.one('\
            SELECT concat(first_name, \' \', last_name) as display_name \
            FROM user_master um \
            WHERE um.user_id = ${id}', {id:id})
        .then((data) => {
            return ses.sendEmailVerification({name:data.display_name, user_id:id, email:email})
                .then(resolve)
                .catch(reject);
        })
        .catch(reject);
    })
}
router.post('/sendEmailVerification', passport.authentication, (req, res) => { // Todo recieve encrypted jwt toekn for employer to join
    const jwtPayload = req.body.jwtPayload;
    sendEmailVerification(jwtPayload.id, jwtPayload.email).then(result=>{
        console.log(result)
        res.json({success:true})
    })
    .catch(err => {
        console.log(err)
        res.status(400).json(err)
    });
});

// @route       GET api/auth/current
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