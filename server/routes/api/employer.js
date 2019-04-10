const express = require('express');
const router = express.Router();
const passport = require('../../config/passport');
const moment = require('moment');

//load input validation
const validateEmployerInput = require('../../validation/employer');  

const db = require('../../config/db')
const postgresdb = db.postgresdb
const pgp = db.pgp
const generateUploadMiddleware = require('../upload').generateUploadMiddleware
const upload = generateUploadMiddleware('profile_image/')

const generateImageFileNameAndValidation = (req, res, next) => {
    // Validate this candidate is with this recruiter
    var jwtPayload = req.body.jwtPayload;
    if(jwtPayload.userType != 2){
        return res.status(400).json({success:false, error:"Must be an account manager for this"})
    }
    var now = Date.now()
    req.params.fileName = jwtPayload.id+"_image_"+now.toString()
    req.params.jwtPayload = jwtPayload
    next()
}

/**
 * Upload recruiter profile image
 * @route GET api/employer/uploadImage
 * @group employer - Employer
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
        return res.status(400).json({success:false, error:"Must be an account manager for this"})
    }
    
    postgresdb.any('\
        SELECT email, first_name, last_name, \
            phone_number, company_name, ec.image_id, \
            street_address_1, street_address_2, city, state, country \
        FROM employer e \
        INNER JOIN employer_contact ec ON ec.employer_id = e.employer_id \
        INNER JOIN login l ON l.user_id = ec.employer_contact_id \
        LEFT JOIN address a ON a.address_id = e.address_id \
        WHERE ec.employer_contact_id = $1', [jwtPayload.id])
    .then((data) => {
        res.json(data)
    })
    .catch(err => {
        console.log(err)
        res.status(400).json(err)
    });
});
/**
 * List employer accounts
 * @route GET api/employer/listEmployers
 * @group employer - Employer
 * @param {Object} body.optional
 * @returns {object} 200 - A map of profile information
 * @returns {Error}  default - Unexpected error
 * @access Private
 */
router.get('/listEmployers', passport.authentication,  (req, res) => {
    var jwtPayload = req.body.jwtPayload;
    if(jwtPayload.userType != 2){
        return res.status(400).json({success:false, error:"Must be an account manager for this"})
    }
    
    postgresdb.any('\
        SELECT \
            e.employer_id, company_name, e.image_id, \
            street_address_1, street_address_2, city, state, country \
        FROM employer e \
        INNER JOIN employer_contact ec ON ec.employer_id = e.employer_id \
        LEFT JOIN address a ON a.address_id = e.address_id \
        WHERE ec.employer_contact_id = $1', [jwtPayload.id])
    .then((data) => {
        res.json({success:true, employers:data})
    })
    .catch(err => {
        console.log(err)
        res.status(400).json({success:false, error:err})
    });
});

/**
 * Add employer account
 * @route POST api/employer/addEmployer
 * @group employer - Employer
 * @param {Object} body.optional
 * @returns {object} 200 - An array of user info
 * @returns {Error}  default - Unexpected error
 * @access Private
 */
router.post('/addEmployer', passport.authentication,  (req, res) => {
    const { errors, isValid } = validateEmployerInput(req.body);
    //check Validation
    if(!isValid) {
        return res.status(400).json(errors);
    }
    var bodyData = req.body;
    var jwtPayload = bodyData.jwtPayload;
    if(jwtPayload.userType != 2){
        return res.status(400).json({success:false, error:"Must be an account manager for this"})
    }
    postgresdb.tx(t => {
        var fields = ['company_name'];
        var addressFields = ['street_address_1', 'street_address_2', 'city', 'state', 'country'];
        var fieldUpdates = fields.map(f=> bodyData[f] != null?bodyData[f]:null);
        var addrFieldUpdates = addressFields.map(f=> bodyData[f] != null?bodyData[f]:null);
        
        // creating a sequence of transaction queries:
        var q1 = new Promise(function(resolve, reject) { resolve({address_id:null}); });
        if(!addrFieldUpdates.some(a=>a != null)){
            q1 = t.one('INSERT INTO address (street_address_1, street_address_2, city, state, country) VALUES ($1, $2, $3, $4, $5) RETURNING address_id',
                    [...addrFieldUpdates])
        }
        return q1.then((addr_ret)=>{
            return t.one('INSERT INTO login(user_type_id) VALUES (4) RETURNING user_id')
            .then((user_ret) => {
                const q3 = t.none('INSERT INTO employer(employer_id, company_name, address_id) VALUES ($1, $2, $3)',
                                [user_ret.user_id, ...fieldUpdates, addr_ret.address_id]);
                const q4 = t.none('INSERT INTO employer_contact(employer_id, employer_contact_id, isAdmin) VALUES ($1, $2, true)',
                                [user_ret.user_id, jwtPayload.id]);
                return t.batch([q3, q4])
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
        .catch(err => {
            console.log(err)
            res.status(400).json({success: false, error:err})
        });
    })
    .then(() => {
        console.log("Done TX")
    }).catch((err)=>{
        console.log(err) // Not an admin
        return res.status(500).json({success: false, error:err})
    });
});
/**
 * Set employer profile information
 * @route POST api/employer/setEmployerProfile
 * @group employer - Employer
 * @param {Object} body.optional
 * @returns {object} 200 - An array of user info
 * @returns {Error}  default - Unexpected error
 * @access Private
 */
router.post('/setEmployerProfile', passport.authentication,  (req, res) => {
    const { errors, isValid } = validateEmployerInput(req.body);
    //check Validation
    if(!isValid) {
        return res.status(400).json(errors);
    }
    var bodyData = req.body;
    var jwtPayload = bodyData.jwtPayload;
    if(jwtPayload.userType != 2){
        return res.status(400).json({success:false, error:"Must be an account manager for this"})
    }
    postgresdb.tx(t => {
        var fields = ['company_name'];
        var addressFields = ['street_address_1', 'street_address_2', 'city', 'state', 'country'];
        return t.one('SELECT ec.employer_id, first_name, last_name, phone_number, company_name, e.address_id, street_address_1, street_address_2, city, state, country \
                        FROM employer e \
                        INNER JOIN employer_contact ec ON ec.employer_id = e.employer_id AND ec.isAdmin \
                        INNER JOIN account_manager ac ON ac.account_manager_id = ec.employer_contact_id \
                        LEFT JOIN address a ON e.address_id = a.address_id\
                        WHERE ec.employer_contact_id = $1 AND e.employer_id = $2', [jwtPayload.id, bodyData.employerId]).then((data)=>{
            var employer_id = bodyData.employerId;
            var addressId = data.address_id;
            var addressIdExists = (data.address_id != null);
            var fieldUpdates = fields.map(f=> bodyData[f] != null?bodyData[f]:data[f]);
            var addrFieldUpdates = addressFields.map(f=> bodyData[f] != null?bodyData[f]:data[f]);
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
                const q2 = t.none('UPDATE employer SET company_name=$1, address_id=$2 WHERE employer_id = $3',
                                [...fieldUpdates, addressId, employer_id]);
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
        .catch(err => {
            console.log(err)
            res.status(400).json({success: false, error:err})
        });
    })
    .then(() => {
        console.log("Done TX")
    }).catch((err)=>{
        console.log(err) // Not an admin
        return res.status(500).json({success: false, error:err})
    });
});

const employerContactHelper = new pgp.helpers.ColumnSet(['employer_contact_id', 'employer_id'], {table: 'employer_contact'});
/**
 * Add a new contact to an employer, must be an admin for the employer to do so
 * @route POST api/employer/addContactToEmployer
 * @group employer - Employer
 * @param {Object} body.optional
 * @returns {object} 200 - An array of user info
 * @returns {Error}  default - Unexpected error
 * @access Private
 */
router.post('/addContactToEmployer', passport.authentication,  (req, res) => {
    // const { errors, isValid } = validateEmployerInput(req.body);
    //check Validation
    // if(!isValid) {
    //     return res.status(400).json(errors);
    // }
    /**
     * Input: Must be admin
     * userIds <list>
     * employerId
     */
    var bodyData = req.body;
    var jwtPayload = bodyData.jwtPayload;
    if(jwtPayload.userType != 2){
        return res.status(400).json({success:false, error:"Must be an account manager for this"})
    }

    postgresdb.tx(t => {
        return t.one('SELECT ec.employer_id \
                        FROM employer_contact ec \
                        WHERE ec.employer_contact_id = ${employer_contact_id} AND ec.employer_id = ${employer_id} AND ec.isAdmin',
                        {employer_contact_id:jwtPayload.id, employer_id:bodyData.employerId})
            .then(()=>{
                const data = bodyData.userIds.map(id=>{
                    return {
                        employer_contact_id: id,
                        employer_id: bodyData.employerId
                    }
                })
                const query = pgp.helpers.insert(data, employerContactHelper);
                return t.none(query)
                .then(()=>{
                    // TODO: send request email to contact to make a password
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
                res.status(400).json({success: false, error:"Either not with this employer, or not an admin"})
            });
    })
    .then(() => {
        console.log("Done TX")
    }).catch((err)=>{
        console.log(err) // Not an admin
        return res.status(500).json({success: false, error:err})
    });
});
router.post('/removeContactFromEmployer', passport.authentication,  (req, res) => {
    // const { errors, isValid } = validateEmployerInput(req.body);
    //check Validation
    // if(!isValid) {
    //     return res.status(400).json(errors);
    // }
    /**
     * Input: Must be admin
     * userId
     * employerId
     */
    var bodyData = req.body;
    var jwtPayload = bodyData.jwtPayload;
    if(jwtPayload.userType != 2){
        return res.status(400).json({success:false, error:"Must be an account manager for this"})
    }
    if(bodyData.userId === jwtPayload.id){
        return res.status(400).json({success:false, error:"Can not remove yourself"})
    }
    postgresdb.tx(t => {
        return t.one('SELECT ec.employer_id \
                        FROM employer_contact ec \
                        WHERE ec.employer_contact_id = ${employer_contact_id} AND ec.employer_id = ${employer_id} AND ec.isAdmin',
                        {employer_contact_id:jwtPayload.id, employer_id:bodyData.employerId})
            .then(()=>{
                return t.none('DELETE FROM employer_contact \
                WHERE employer_contact_id = ${employer_contact_id} AND employer_id = ${employer_id}',
                {employer_contact_id:bodyData.userId, employer_id:bodyData.employerId})
                .then(()=>{
                    // TODO: send request email to contact to make a password
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
                res.status(400).json({success: false, error:"Either not with this employer, or not an admin"})
            });
    })
    .then(() => {
        console.log("Done TX")
    }).catch((err)=>{
        console.log(err) // Not an admin
        return res.status(500).json({success: false, error:err})
    });
});

/**
 * Change contact's admin status
 * @route POST api/employer/setContactAdmin
 * @group employer - Employer
 * @param {Object} body.optional
 * @returns {object} 200 - An array of user info
 * @returns {Error}  default - Unexpected error
 * @access Private
 */
router.post('/setContactAdmin', passport.authentication,  (req, res) => {
    // const { errors, isValid } = validateEmployerInput(req.body);
    //check Validation
    // if(!isValid) {
    //     return res.status(400).json(errors);
    // }
    /**
     * Input: Must be admin
     * employerContactId
     * isAdmin
     * employerId
     */
    var bodyData = req.body;
    var jwtPayload = bodyData.jwtPayload;
    if(jwtPayload.userType != 2){
        return res.status(400).json({success:false, error:"Must be an account manager for this"})
    }
    
    var employerContactId = req.body.employerContactId
    if(employerContactId == null)
        return res.status(400).json({success:false, error:"Missing employerContactId field"})
    if(employerContactId == jwtPayload.id)
        return res.status(400).json({success:false, error:"Can't change your own administrator setting"})
    var isAdmin = req.body.isAdmin
    if(isAdmin == null)
        return res.status(400).json({success:false, error:"Missing isAdmin field"})

    postgresdb.tx(t => {
        return t.one('SELECT ec.employer_id \
                        FROM employer_contact ec \
                        WHERE ec.employer_contact_id = ${employer_contact_id} AND ec.employer_id = ${employer_id} AND ec.isAdmin',
                        {employer_contact_id:jwtPayload.id, employer_id:bodyData.employerId})
            .then(()=>{
                return t.none('UPDATE employer_contact SET isAdmin=${isAdmin} WHERE employer_contact_id = ${employerContactId}',
                    {isAdmin:isAdmin, employerContactId:employerContactId})
                .then(()=>{
                    // TODO: send request email to contact to make a password
                    res.status(200).json({success: true})
                    return []
                })
                .catch(err => {
                    console.log(err)
                    res.status(400).json({success: false, error:err})
                    return []
                });
            })
            .catch(err => {
                console.log(err)
                res.status(400).json({success: false, error:"Either not with this employer, or not an admin"})
            });
    })
    .then(() => {
        console.log("Done TX")
    }).catch((err)=>{
        console.log(err) // Not an admin
        return res.status(500).json({success: false, error:err})
    });
});

/**
 * Get employer contact list
 * @route GET api/employer/getEmployerContactList
 * @group employer - Employer
 * @param {Object} body.optional
 * @returns {object} 200 - A list of contacts
 * @returns {Error}  default - Unexpected error
 * @access Private
 */
router.get('/getEmployerContactList/:employerId', passport.authentication,  getEmployerContactList)
router.get('/getEmployerContactList/:employerId/:page', passport.authentication,  getEmployerContactList)
function getEmployerContactList(req, res) {
    var jwtPayload = req.body.jwtPayload;
    if(jwtPayload.userType != 2){
        return res.status(400).json({success:false, error:"Must be an account manager for this"})
    }
    var page = req.params.page;
    if(page == null)
        page = 1;
    postgresdb.tx(t => {
        return t.one('SELECT ec.employer_id \
                        FROM employer_contact ec \
                        WHERE ec.employer_contact_id = ${employer_contact_id} AND ec.employer_id = ${employer_id} AND ec.isAdmin',
                        {employer_contact_id:jwtPayload.id, employer_id:req.params.employerId})
            .then(()=>{
                return t.any('\
                    SELECT ec.employer_contact_id, um.email, um.first_name, um.last_name, \
                        um.phone_number, um.image_id, um.created_on, ec.isAdmin, \
                        um.account_active, \
                        (count(1) OVER())/10+1 AS page_count \
                    FROM employer_contact ec \
                    INNER JOIN user_master um ON ec.employer_contact_id = um.user_id \
                    WHERE ec.employer_id = ${employer_id} AND um.active \
                    ORDER BY um.last_name ASC, um.first_name ASC \
                    OFFSET ${page} \
                    LIMIT 10', {employer_id:req.params.employerId, page:(page-1)*10})
                .then((data) => {
                    // Marshal data
                    data = data.map(m=>{
                        m.isMe = (jwtPayload.id === m.employer_contact_id);
                        var timestamp = moment(m.created_on);
                        var ms = timestamp.diff(moment());
                        m.created = moment.duration(ms).humanize() + " ago";
                        m.created_on = timestamp.format("x");
                        return m
                    })
                    res.json({success: true, contactList:data})
                })
                .catch(err => {
                    console.log(err)
                    res.status(400).json({success: false, error:err})
                });
            })
            .catch(err => {
                console.log(err)
                res.status(400).json({success: false, error:"Either not with this employer, or not an admin"})
            });
    })
    .then((data) => { })
    .catch(err => {
        console.log(err)
        res.status(400).json({success: false, error:err})
    });
}

/**
 * Get employer contact list
 * @route GET api/employer/getEmployerContactList
 * @group employer - Employer
 * @param {Object} body.optional
 * @returns {object} 200 - A list of contacts
 * @returns {Error}  default - Unexpected error
 * @access Private
 */
router.get('/getAccountManagers', passport.authentication,  getAccountManagers)
router.get('/getAccountManagers/:page', passport.authentication,  getAccountManagers)
router.get('/getAccountManagers/search/:searchString', passport.authentication,  getAccountManagers)
router.get('/getAccountManagers/search/:searchString/:page', passport.authentication,  getAccountManagers)
function getAccountManagers(req, res) {
    var jwtPayload = req.body.jwtPayload;
    if(jwtPayload.userType != 2){
        return res.status(400).json({success:false, error:"Must be an account manager for this"})
    }
    var page = req.params.page;
    var searchString = req.params.searchString;
    if(searchString != null)
    searchString = searchString.split(' ').map(d=>d+":*").join(" & ")
    if(page == null)
        page = 1;
    postgresdb.any('\
        SELECT l.user_id, l.email, ac.first_name, ac.last_name, \
            ac.phone_number, ac.image_id, l.created_on, \
            (count(1) OVER())/10+1 AS page_count \
        FROM account_manager ac \
        INNER JOIN login l ON l.user_id = ac.account_manager_id \
        WHERE l.user_type_id = 2 AND ac.active \
        '+(searchString?' \
        AND ((name_search) @@ to_tsquery(\'simple\', ${searchString})) \
        ORDER BY ts_rank_cd(name_search, to_tsquery(\'simple\', ${searchString})) DESC ':
        'ORDER BY ac.last_name ASC, ac.first_name ASC ')+
        'OFFSET ${page} \
        LIMIT 10', {page:(page-1)*10, searchString:searchString})
    .then((data) => { 
        data = data.map(m=>{
            var timestamp = moment(m.created_on);
            var ms = timestamp.diff(moment());
            m.created = moment.duration(ms).humanize() + " ago";
            m.created_on = timestamp.format("x");
            return m
        })
        res.json({success: true, accountManagers:data})
    })
    .catch(err => {
        console.log(err)
        res.status(400).json({success: false, error:err})
    });
}

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
        return res.status(400).json({success:false, error:"Must be an account manager for this"})
    }
    var fields = ['first_name', 'last_name', 'phone_number'];
    postgresdb.one('SELECT first_name, last_name, phone_number \
                    FROM employer_contact e \
                    WHERE employer_contact_id = ${employer_contact_id}', {employer_contact_id:jwtPayload.id}).then((data)=>{
        var fieldUpdates = fields.map(f=> bodyData[f] != null?bodyData[f]:data[f]);
        postgresdb.none('UPDATE employer_contact SET first_name=$1, last_name=$2, phone_number=$3 WHERE employer_contact_id = $4',
            [...fieldUpdates, jwtPayload.id])
        .then(() => {
            res.status(200).json({success: true})
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
        return res.status(400).json({success:false, error:"Must be an account manager for this"})
    }
    
    postgresdb.any('\
        SELECT c.candidate_id, jp.post_id, cp.created_on, c.first_name, coins, count(1) OVER() AS alert_count, jp.title \
        FROM candidate_posting cp \
        INNER JOIN job_posting jp ON cp.post_id = jp.post_id \
        INNER JOIN candidate c ON c.candidate_id = cp.candidate_id \
        INNER JOIN employer_contact ec ON ec.employer_id = jp.employer_id \
        WHERE NOT cp.has_seen_post AND ec.employer_contact_id = ${employer_contact_id} \
        ORDER BY created_on DESC \
        LIMIT 10', {employer_contact_id:jwtPayload.id})
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