const express = require('express');
const router = express.Router();
const passport = require('../config/passport');
const moment = require('moment');

//load input validation
const validateEmployerInput = require('../validation/employer');  

const db = require('../config/db')
const postgresdb = db.postgresdb
const pgp = db.pgp
const generateUploadMiddleware = require('../utils/upload').generateUploadMiddleware
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
    postgresdb.none('UPDATE employer SET image_id=$1 WHERE company_id = $2', [req.params.finalFileName, jwtPayload.id])
    .then((data) => {
        res.json({success:true, image_id:req.params.finalFileName})
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
            e.company_id, company_name, department, e.image_id, \
            address_line_1 as "addressLine1", \
            address_line_2 as "addressLine2", \
            city, state, country, lat, lon, \
            state_code as "stateCode", \
            country_code as "countryCode" \
        FROM employer e \
        INNER JOIN company_contact ec ON ec.company_id = e.company_id \
        LEFT JOIN address a ON a.address_id = e.address_id \
        WHERE ec.company_contact_id = $1', [jwtPayload.id])
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
        var fields = ['company_name', 'department'];
        var addressFields = ['address_line_1', 'address_line_2', 'city', 'state', 'country'];
        var fieldUpdates = fields.map(f=> bodyData[f] != null?bodyData[f]:null);
        var addrFieldUpdates = addressFields.map(f=> bodyData[f] != null?bodyData[f]:null);
        
        // creating a sequence of transaction queries:
        var q1 = new Promise(function(resolve, reject) { resolve({address_id:null}); });
        if(!addrFieldUpdates.some(a=>a != null)){
            q1 = t.one('INSERT INTO address (address_line_1, address_line_2, city, state, country) VALUES ($1, $2, $3, $4, $5) RETURNING address_id',
                    [...addrFieldUpdates])
        }
        return q1.then((addr_ret)=>{
            return t.one('INSERT INTO login(user_type_id) VALUES (4) RETURNING user_id')
            .then((user_ret) => {
                const q3 = t.none('INSERT INTO employer(company_id, company_name, department, address_id) VALUES ($1, $2, $3, $4)',
                                [user_ret.user_id, ...fieldUpdates, addr_ret.address_id]);
                const q4 = t.none('INSERT INTO company_contact(company_id, company_contact_id, is_primary) VALUES ($1, $2, true)',
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
        var fields = ['company_name', 'department'];
        var addressFields = ['address_line_1', 'address_line_2', 'city', 'state', 'country'];
        return t.one('SELECT ec.company_id, first_name, last_name, phone_number, company_name, department, e.address_id, address_line_1, address_line_2, city, state, country \
                        FROM employer e \
                        INNER JOIN company_contact ec ON ec.company_id = e.company_id AND ec.is_primary \
                        INNER JOIN account_manager ac ON ac.account_manager_id = ec.company_contact_id \
                        LEFT JOIN address a ON e.address_id = a.address_id\
                        WHERE ec.company_contact_id = $1 AND e.company_id = $2', [jwtPayload.id, bodyData.employerId]).then((data)=>{
            var company_id = bodyData.employerId;
            var addressId = data.address_id;
            var addressIdExists = (data.address_id != null);
            var fieldUpdates = fields.map(f=> bodyData[f] != null?bodyData[f]:data[f]);
            var addrFieldUpdates = addressFields.map(f=> bodyData[f] != null?bodyData[f]:data[f]);
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
                const q2 = t.none('UPDATE employer SET company_name=$1, department=$2 address_id=$3 WHERE company_id = $4',
                                [...fieldUpdates, addressId, company_id]);
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

const employerContactHelper = new pgp.helpers.ColumnSet(['company_contact_id', 'company_id'], {table: 'company_contact'});
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
        return t.one('SELECT ec.company_id \
                        FROM company_contact ec \
                        WHERE ec.company_contact_id = ${company_contact_id} AND ec.company_id = ${company_id} AND ec.is_primary',
                        {company_contact_id:jwtPayload.id, company_id:bodyData.employerId})
            .then(()=>{
                const data = bodyData.userIds.map(id=>{
                    return {
                        company_contact_id: id,
                        company_id: bodyData.employerId
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
        return t.one('SELECT ec.company_id \
                        FROM company_contact ec \
                        WHERE ec.company_contact_id = ${company_contact_id} AND ec.company_id = ${company_id} AND ec.is_primary',
                        {company_contact_id:jwtPayload.id, company_id:bodyData.employerId})
            .then(()=>{
                return t.none('DELETE FROM company_contact \
                WHERE company_contact_id = ${company_contact_id} AND company_id = ${company_id}',
                {company_contact_id:bodyData.userId, company_id:bodyData.employerId})
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
     * isPrimary
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
    var isPrimary = req.body.isPrimary
    if(isPrimary == null)
        return res.status(400).json({success:false, error:"Missing isPrimary field"})

    postgresdb.tx(t => {
        return t.one('SELECT ec.company_id \
                        FROM company_contact ec \
                        WHERE ec.company_contact_id = ${company_contact_id} AND ec.company_id = ${company_id} AND ec.is_primary',
                        {company_contact_id:jwtPayload.id, company_id:bodyData.employerId})
            .then(()=>{
                return t.none('UPDATE company_contact SET is_primary=${is_primary} WHERE company_contact_id = ${employerContactId}',
                    {is_primary:isPrimary, employerContactId:employerContactId})
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
        return t.one('SELECT ec.company_id \
                        FROM company_contact ec \
                        WHERE ec.company_contact_id = ${company_contact_id} AND ec.company_id = ${company_id} AND ec.is_primary',
                        {company_contact_id:jwtPayload.id, company_id:req.params.employerId})
            .then(()=>{
                return t.any('\
                    SELECT ec.company_contact_id, um.email, um.first_name, um.last_name, \
                        um.phone_number, um.image_id, um.created_on, ec.is_primary, \
                        um.account_active, \
                        (count(1) OVER())/10+1 AS page_count \
                    FROM company_contact ec \
                    INNER JOIN user_master um ON ec.company_contact_id = um.user_id \
                    WHERE ec.company_id = ${company_id} AND um.active \
                    ORDER BY um.last_name ASC, um.first_name ASC \
                    OFFSET ${page} \
                    LIMIT 10', {company_id:req.params.employerId, page:(page-1)*10})
                .then((data) => {
                    // Marshal data
                    data = data.map(m=>{
                        m.isMe = (jwtPayload.id === m.company_contact_id);
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

module.exports = router;