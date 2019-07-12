const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('../config/passport');
const ses = require('../utils/ses');
const postingAssign = require('../utils/postingAssign');
const logger = require('../utils/logging');
const address = require('../utils/address');
const db = require('../config/db')
const postgresdb = db.postgresdb
const pgp = db.pgp

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

// router.post('/saml/callback', passport.passportObject.authenticate('saml', {
//     failureRedirect: '/error',
//     failureFlash: true
//   }), function (req, res) {
//     res.redirect('/')
//   })

/**
 * Login Route
 * @route GET api/auth/login
 * @group auth - Auth
 * @param {Object} body.optional
 * @returns {object} 200 - A map of profile information
 * @returns {Error}  default - Unexpected error
 * @access Public
 */
router.post('/login', (req, res) => {
    const { errors, isValid } = validateLoginInput(req.body);
    // Check Validation 
    if (!isValid) {
        const errorMessage = "Invalid Parameters"
        logger.error('Route Params Mismatch', {tags:['login', 'validation'], url:req.originalUrl, body: req.body, params: req.params, error:errorMessage, errors:errors});

        return res.status(400).json({success:false, errors:errors});
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
        if(user.user_type_id !== 1 && user.user_type_id !== 2){
            errors.email = 'This type of user cannot login';
            logger.error('Email not registered', {tags:['login'], email:email, ip:loginIp});
            return res.status(400).json({success:false, errors:errors});
        }
        else if (!user) {
            errors.email = 'Email not registered';
            logger.error('Email not registered', {tags:['login'], email:email, ip:loginIp});
            return res.status(400).json({success:false, errors:errors});
        } else {
            bcrypt.compare(password, user.passwordhash).then(isMatch => {
                if(isMatch) {
                    postgresdb.none('INSERT INTO login_history (user_id, login_ip) VALUES ($1, $2)',
                            [user.user_id, loginIp]).then(()=>{})
                    createJWT(payload).then((token)=>{
                        logger.info('Successful login', {tags:['login'], email:email, ip:loginIp});
                        res.status(200).json(token)
                    })
                    .catch(err => {
                        logger.error('Error generating token', {tags:['login'], email:email, ip:loginIp, error:err});
                        res.status(500).json({success: false, error:err})
                    });
                } else {
                    errors.password = "Password Incorrect";
                    logger.error('Password Incorrect', {tags:['login'], email:email, ip:loginIp});
                    return res.status(400).json({success:false, errors:errors})
                }
            });
    
        }
    })
    .catch(err => {
        logger.error('Error in sql', {tags:['login', 'sql'], email:email, ip:loginIp, error:err.message||err})
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

/**
 * Register User
 * @route GET api/auth/register
 * @group auth - Auth
 * @param {Object} body.optional
 * @returns {object} 200 - A map of profile information
 * @returns {Error}  default - Unexpected error
 * @access Public
 */
router.post('/register', (req, res) => { // Todo recieve encrypted jwt toekn for employer to join
    var body = req.body;
    const { errors, isValid } = validateRegisterInput(body);
    const loginIp = req.connection.remoteAddress;
    // Check Validation 
    if (!isValid) {
        const errorMessage = "Invalid Parameters"
        logger.error('Route Params Mismatch', {tags:['register', 'validation'], url:req.originalUrl, body: req.body, params: req.params, error:errorMessage, errors:errors});
        return res.status(400).json({success:false, errors:errors});
    }
    const email = body.email
    const type = body.type;
    checkEmailExists(email).then(user => {
        if (user) {
            logger.error('Email already exists', {tags:['register'], url:req.originalUrl, email:email, ip:loginIp});
            errors.email = 'Email already exists';
            return res.status(400).json({success:false, errors:errors});
        } else {
            if(type == 1){ // Recruiter
                bcrypt.hash(body.password, 10).then((hash)=>{
                    postgresdb.tx(t => {
                        // creating a sequence of transaction queries:
                        const q1 = t.one('INSERT INTO login (email, passwordhash, user_type_id) VALUES ($1, $2, $3) RETURNING user_id',
                                        [email, hash, type]);
                        const qc = t.one('INSERT INTO login (user_type_id) VALUES (4) RETURNING user_id', []);
                        return t.batch([q1, qc]).then((ret)=>{
                            const login_ret = ret[0];
                            const company_login_ret = ret[1];
                            const payload = {
                                id: login_ret.user_id,
                                userType: type,
                                email: email,
                                isPrimary: true,
                                isVerified: false
                            }
                            const lh = t.none('INSERT INTO login_history (user_id, login_ip) VALUES ($1, $2)',
                                    [login_ret.user_id, loginIp])
                            const q2 = t.none('INSERT INTO company (company_id, company_name, address_id, company_type) VALUES ($1, $2, $3, 2)',
                                    [company_login_ret.user_id, body.companyName, null])
                            const q3 = t.none('INSERT INTO employer (employer_id, first_name, last_name, phone_number, address_id) VALUES ($1, $2, $3, $4, $5)',
                                    [login_ret.user_id, body.firstName, body.lastName, body.phoneNumber, null])
                            const q4 = t.none('INSERT INTO company_contact (company_contact_id, company_id, is_primary) VALUES ($1, $2, true)',
                                    [login_ret.user_id, company_login_ret.user_id])
                            return t.batch([lh, q2, q3, q4]).then(() => {
                                sendEmailVerification(payload.id, payload.email).catch(()=>{}) // Async to send email verification

                                return createJWT(payload).then((token)=>{
                                    res.status(200).json(token)
                                })
                            })
                        })
                        .catch(err => {
                            logger.error('Error registering', {tags:['register', 'sql'], url:req.originalUrl, email:email, ip:loginIp, type: type, error:err.message || err});
                            res.status(500).json({success: false, error:err})
                        })
                    }).catch((err)=>{
                        logger.error('Error registering', {tags:['register', 'sql'], url:req.originalUrl, email:email, ip:loginIp, type: type, error:err.message || err});
                        return res.status(500).json({success: false, error:err})
                    });
                }, (err)=>{
                    logger.error('Error registering', {tags:['register', 'password'], url:req.originalUrl, email:email, ip:loginIp, type: type, error:err});
                    return res.status(500).json({success: false, error:err})
                })
            }
            else if(type == 3){ // Employer
                postgresdb.tx(t => {
                    // creating a sequence of transaction queries:
                    const q1 = t.one('INSERT INTO login (email, user_type_id) VALUES ($1, $2) RETURNING user_id',
                                    [email, type]);
                    const qc = t.one('INSERT INTO login (user_type_id) VALUES (4) RETURNING user_id', []);
                    return t.batch([q1, qc]).then((ret)=>{
                        const login_ret = ret[0];
                        const company_login_ret = ret[1];
                        const payload = {
                            id: login_ret.user_id,
                            userType: type,
                            email: email,
                            isPrimary: true,
                            isVerified: false
                        }
                        const lh = t.none('INSERT INTO login_history (user_id, login_ip) VALUES ($1, $2)',
                                [login_ret.user_id, loginIp])
                        const q2 = t.none('INSERT INTO company (company_id, company_name, address_id, company_type) VALUES ($1, $2, $3, 1)',
                                [company_login_ret.user_id, body.companyName, null])
                        const q3 = t.none('INSERT INTO employer (employer_id, first_name, last_name, phone_number, address_id) VALUES ($1, $2, $3, $4, $5)',
                                [login_ret.user_id, body.firstName, body.lastName, body.phoneNumber, null])
                        const q4 = t.none('INSERT INTO company_contact (company_contact_id, company_id, is_primary) VALUES ($1, $2, true)',
                                [login_ret.user_id, company_login_ret.user_id])
                        return t.batch([lh, q2, q3, q4]).then(() => {
                            sendEmailVerification(payload.id, payload.email).catch(()=>{}) // Async to send email verification

                            return createJWT(payload).then((token)=>{
                                res.status(200).json(token)
                            })
                        })
                    })
                    .catch(err => {
                        logger.error('Error registering', {tags:['register', 'sql'], url:req.originalUrl, email:email, ip:loginIp, type: type, error:err.message || err});
                        res.status(500).json({success: false, error:err})
                    })
                }).catch((err)=>{
                    logger.error('Error registering', {tags:['register', 'sql'], url:req.originalUrl, email:email, ip:loginIp, type: type, error:err.message || err});
                    return res.status(500).json({success: false, error:err})
                });
            }
        }
    }).catch((err)=>{
        logger.error('Error checking for registered email', {tags:['register', 'sql'], url:req.originalUrl, email:email, ip:loginIp, error:err.message || err});
        return res.status(500).json({success: false, error:err})
    });
});

/**
 * Reset a user's password
 * @route POST api/auth/resetPassword
 * @group auth - Auth
 * @param {Object} body.optional
 * @returns {object} 200 - A map of profile information
 * @returns {Error}  default - Unexpected error
 * @access Public
 */
router.post('/resetPassword', (req, res) => { // Todo recieve encrypted jwt token for employer to join
    var body = req.body;
    if (body.token == null) {
        const errorMessage = "Missing Parameter token"
        logger.error('Route Params Mismatch', {tags:['register', 'validation'], url:req.originalUrl, body: req.body, params: req.params, error:errorMessage, errors:errors});
        return res.status(400).json({success:false, error:errorMessage});
    }
    if (body.password == null) {
        const errorMessage = "Missing Parameter password"
        logger.error('Route Params Mismatch', {tags:['register', 'validation'], url:req.originalUrl, body: req.body, params: req.params, error:errorMessage, errors:errors});
        return res.status(400).json({success:false, error:errorMessage});
    }
    passport.decodeToken(body.token).then(payload=>{
        bcrypt.hash(body.password, 10).then((hash)=>{
            postgresdb.none('UPDATE login SET passwordhash=${password} WHERE lower(email) = ${email}',
                            {email:payload.email, password: hash})
                .then(() => {
                    res.json({success:true})
                })
        })
    }).catch(err=>res.status(500).json({success:false, error:err}))
});

/**
 * Sent a password reset email
 * @route POST api/auth/sendPasswordReset
 * @group auth - Auth
 * @param {Object} body.optional
 * @returns {object} 200 - A map of profile information
 * @returns {Error}  default - Unexpected error
 * @access Public
 */
router.post('/sendPasswordReset', (req, res) => { // Todo recieve encrypted jwt toekn for employer to join
    if (req.body.email == null) {
        const errorMessage = "Missing Parameter email"
        logger.error('Route Params Mismatch', {tags:['register', 'validation'], url:req.originalUrl, body: req.body, params: req.params, error:errorMessage, errors:errors});
        return res.status(400).json({success:false, error:errorMessage});
    }
    const email = req.body.email.trim();
    const ip = req.connection.remoteAddress;
    return postgresdb.one('\
        SELECT concat(first_name, \' \', last_name) as display_name, user_id \
        FROM user_master um \
        WHERE lower(um.email) = ${email}', {email:email})
    .then((data) => {
        return ses.resetPasswordEmail({name:data.display_name, email:email})
    })
    .then(result=>{
        logger.info('Sent password reset', {tags:['login', 'password'], email:email, ip:ip});
        res.json({success:true})
    })
    .catch(err => {
        logger.error('Error sending password reset', {tags:['login', 'password', 'sql'], url:req.originalUrl, email:email, ip:ip, error:err.message || err});
        res.status(500).json({success:false, error:err})
    });
});

// Todo: Add that the user must be authenticated, requires page redirects reroutes on login
/**
 * Verify a registered user's email
 * @route POST api/auth/verifyEmail
 * @group auth - Auth
 * @param {Object} body.optional
 * @returns {object} 200 - A map of profile information
 * @returns {Error}  default - Unexpected error
 * @access Public
 */
router.post('/verifyEmail', /*passport.authentication,*/ (req, res) => {
    var body = req.body;
    if (body.token == null) {
        const errorMessage = "Missing Parameter token"
        logger.error('Route Params Mismatch', {tags:['register', 'validation'], url:req.originalUrl, body: req.body, params: req.params, error:errorMessage, errors:errors});
        return res.status(400).json({success:false, error:errorMessage});
    }
    const ip = req.connection.remoteAddress;
    passport.decodeToken(body.token).then(payload=>{
        const userId = payload.userId;
        postgresdb.none('UPDATE login SET email_verified=true WHERE user_id = ${id}',
                        {id:userId})
            .then(() => {
                if(payload.type === 3)
                    return Promise.resolve()
                else
                    return postingAssign.findPostsForNewRecruiter(payload.id)
            })
            .then((data)=>{
                logger.info('Recieved email verification', {tags:['register'], userId:userId, ip:ip});
                if(payload.type === 3)
                    return Promise.resolve()
                else
                    return postingAssign.assignJobToRecruiter(data.map(d=> {return {post_id: d.post_id, recruiter_id: payload.id}}))
            }) // Async call to add posts to the new recruiter
            .then(() => {
                res.json({success:true, type: payload.type})
            })
            .catch(err=>{
                logger.error('Error recieving email verification', {tags:['register', 'sql'], url:req.originalUrl, userId:userId, ip:ip, error:err.message || err});
                res.status(500).json({success:false, error:err})
            })
    }).catch(err=>{
        logger.error('Error recieving email verification', {tags:['register', 'sql'], url:req.originalUrl, userId:userId, ip:ip, error:err.message || err});
        res.status(500).json({success:false, error:err})
    })
});
function sendEmailVerification(id, email, ip){
    return new Promise((resolve, reject)=>{
        return postgresdb.one('\
            SELECT concat(first_name, \' \', last_name) as display_name, user_type_id \
            FROM user_master um \
            WHERE um.user_id = ${id}', {id:id})
        .then((data) => {
            return ses.sendEmailVerification({name:data.display_name, userId:id, type:data.user_type_id, email:email})
        })
        .then(()=>{
            logger.info('Sent email verification', {tags:['register'], email:email, userId:id, ip:ip});
            resolve()
        })
        .catch((err)=>{
            logger.error('Error sending email verification', {tags:['register', 'sql'], email:email, ip:ip, error:err.message || err});
            reject(err)
        });
    })
}

/**
 * Send a verification email
 * @route POST api/auth/sendEmailVerification
 * @group auth - Auth
 * @param {Object} body.optional
 * @returns {object} 200 - A map of profile information
 * @returns {Error}  default - Unexpected error
 * @access Public
 */
router.post('/sendEmailVerification', (req, res) => {
    const ip = req.connection.remoteAddress;
    return postgresdb.one('\
        SELECT user_id, email \
        FROM user_master um \
        WHERE um.email = ${email}', {email:req.body.email})
    .then((data) => {
        sendEmailVerification(data.user_id, data.email, ip).then(result=>{
            res.json({success:true})
        })
        .catch(err => {
            res.status(500).json({success:false, error:err})
        });
    })
    .catch(err => {
        logger.error('Error sending email verification', {tags:['register', 'sql'], url:req.originalUrl, body: req.body, ip:ip, error:err.message || err});
        res.status(500).json({success:false, error:err})
    });
});

/**
 * Get user's current information
 * @route POST api/auth/current
 * @group auth - Auth
 * @param {Object} body.optional
 * @returns {object} 200 - A map of profile information
 * @returns {Error}  default - Unexpected error
 * @access Private
 */
router.get('/current', passport.authentication, (req, res) => {
    const ip = req.connection.remoteAddress;
    postgresdb.one('\
        SELECT c.company_id as "company", \
            a.* \
        FROM company_contact ec \
        INNER JOIN company c ON c.company_id = ec.company_id \
        LEFT JOIN address a ON a.address_id = c.address_id \
        WHERE c.active AND ec.company_contact_id = ${userId} \
        LIMIT 1', {userId:req.body.jwtPayload.id})
    .then((data) => {
        data = db.camelizeFields(data)
        address.convertFieldsToMap(data)
        res.json({success: true, data: {...req.body.jwtPayload, ...data}})
    }).catch((err)=>{
        logger.error('Get current jwt data', {tags:['jwt', 'sql'], url:req.originalUrl, ...req.body.jwtPayload, ip:ip, error:err.message || err});
        return res.status(500).json({success: false, error:err})
    });
});

module.exports = router;