const express = require('express');
const router = express.Router();
const passport = require('../config/passport');
const moment = require('moment');
const invite = require('../utils/invite')
//load input validation
const validateCompanyInput = require('../validation/company');  

const db = require('../config/db')
const postgresdb = db.postgresdb
const pgp = db.pgp

/**
 * List company accounts
 * @route GET api/company/list
 * @group company - Company
 * @param {Object} body.optional
 * @returns {object} 200 - A map of profile information
 * @returns {Error}  default - Unexpected error
 * @access Private
 */
router.get('/list', passport.authentication,  (req, res) => {
    const jwtPayload = req.body.jwtPayload;
    
    if(jwtPayload.userType !== 2 && jwtPayload.userType !== 1){
        return res.status(400).json({success:false, error:"Invalid user"})
    }
    
    postgresdb.any('\
        SELECT \
            c.company_id, company_name, department, c.image_id, \
            address_line_1 as "addressLine1", \
            address_line_2 as "addressLine2", \
            city, state, country, lat, lon, \
            state_code as "stateCode", \
            country_code as "countryCode", \
            ec.is_primary \
        FROM login l \
        INNER JOIN company_contact ec ON ec.company_contact_id = l.user_id \
        INNER JOIN company c ON c.company_id = ec.company_id \
        LEFT JOIN address a ON a.address_id = c.address_id \
        WHERE ec.company_contact_id = ${userId} \
        ORDER BY company_name', {userId:jwtPayload.id})
    .then((data) => {
        res.json({success:true, companies:data})
    })
    .catch(err => {
        console.log(err)
        res.status(400).json({success:false, error:err})
    });
});

/**
 * Add company account
 * @route POST api/company/addCompany
 * @group company - Company
 * @param {Object} body.optional
 * @returns {object} 200 - An array of user info
 * @returns {Error}  default - Unexpected error
 * @access Private
 */
router.post('/addCompany', passport.authentication,  (req, res) => {
    const { errors, isValid } = validateCompanyInput(req.body);
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
                const q3 = t.none('INSERT INTO company(company_id, company_name, department, address_id) VALUES ($1, $2, $3, $4)',
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
 * Set company profile information
 * @route POST api/company/setCompanyProfile
 * @group company - Company
 * @param {Object} body.optional
 * @returns {object} 200 - An array of user info
 * @returns {Error}  default - Unexpected error
 * @access Private
 */
router.post('/setCompanyProfile', passport.authentication,  (req, res) => {
    const { errors, isValid } = validateCompanyInput(req.body);
    //check Validation
    if(!isValid) {
        return res.status(400).json(errors);
    }
    var bodyData = req.body;
    var jwtPayload = bodyData.jwtPayload;
    if(jwtPayload.userType !== 2 && jwtPayload.userType !== 1){
        return res.status(400).json({success:false, error:"Must be an account manager for this"})
    }
    postgresdb.tx(t => {
        var fields = ['company_name', 'department'];
        var addressFields = ['address_line_1', 'address_line_2', 'city', 'state', 'country'];
        return t.one('SELECT ec.company_id, first_name, last_name, phone_number, company_name, department, e.address_id, address_line_1, address_line_2, city, state, country \
                        FROM company e \
                        INNER JOIN company_contact ec ON ec.company_id = e.company_id AND ec.is_primary \
                        INNER JOIN account_manager ac ON ac.account_manager_id = ec.company_contact_id \
                        LEFT JOIN address a ON e.address_id = a.address_id\
                        WHERE ec.company_contact_id = ${userId} AND e.company_id = ${companyId}', {userId:jwtPayload.id, companyId:bodyData.companyId}).then((data)=>{
            var company_id = bodyData.companyId;
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
                const q2 = t.none('UPDATE company SET company_name=$1, department=$2 address_id=$3 WHERE company_id = $4',
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

const companyContactHelper = new pgp.helpers.ColumnSet(['company_contact_id', 'company_id'], {table: 'company_contact'});
/**
 * Add a new contact to an company, must be an admin for the company to do so
 * @route POST api/company/addContactToCompany
 * @group company - Company
 * @param {Object} body.optional
 * @returns {object} 200 - An array of user info
 * @returns {Error}  default - Unexpected error
 * @access Private
 */
router.post('/addContactToCompany', passport.authentication,  (req, res) => {
    // const { errors, isValid } = validateCompanyInput(req.body);
    //check Validation
    // if(!isValid) {
    //     return res.status(400).json(errors);
    // }
    /**
     * Input: Must be admin, either use emails field or userIds field, cannot use both
     * userIds <list>
     * emails <list>
     * companyId
     */
    const bodyData = req.body;
    const jwtPayload = bodyData.jwtPayload;
    const userType = jwtPayload.userType;
    if(userType !== 2 && userType !== 1){
        return res.status(400).json({success:false, error:"Must be an account manager for this"})
    }

    postgresdb.tx(t => {
        return t.one('SELECT ec.company_id, c.company_name \
                        FROM company_contact ec \
                        INNER JOIN company c ON cc.company_id = c.company_id \
                        WHERE ec.company_contact_id = ${company_contact_id} AND ec.company_id = ${company_id} AND ec.is_primary',
                        {company_contact_id:jwtPayload.id, company_id:bodyData.companyId})
            .then(()=>{
                return new Promise((resolve, reject)=>{
                    if(bodyData.userIds){
                        const data = bodyData.userIds.map(id=>{
                            return {
                                company_contact_id: id,
                                company_id: bodyData.companyId
                            }
                        })
                        return resolve(data)
                    }else{
                        return t.any('SELECT l.user_id, l.email, cc.company_id \
                                FROM login l \
                                LEFT JOIN company_contact cc ON cc.company_contact_id = l.user_id \
                                WHERE l.email in (${emails:csv}) AND l.user_type_id = ${userType}',
                                {emails:bodyData.emails, type:userType})
                        .then((users)=>{
                            const alreadyExists = users.filter(d=>d.company_id == bodyData.companyId).map(d=>d.email)
                            const availableToJoin = users.filter(d=>d.company_id == null).map(d=>d.user_id)
                            const usersToAsk = bodyData.emails.filter(d=>!alreadyExists.includes(d)).filter(d=>!availableToJoin.includes(d))
                            if(leftOvers.length > 0){
                                invite.inviteByEmails(usersToAsk, userType, company).then(userIds=>{
                                    // Going to skip force adding people for now
                                })
                            }
                            const data = availableToJoin.map(id=>{
                                return {
                                    company_contact_id: id,
                                    company_id: bodyData.companyId
                                }
                            })
                            return resolve(data)
                        })
                    }
                }).then(data=>{
                    const query = pgp.helpers.insert(data, companyContactHelper);
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
                    res.status(400).json({success: false, error:err})
                });
            })
            .catch(err => {
                console.log(err)
                res.status(400).json({success: false, error:"Either not with this company, or not an admin"})
            });
    })
    .then(() => {
        console.log("Done TX")
    }).catch((err)=>{
        console.log(err) // Not an admin
        return res.status(500).json({success: false, error:err})
    });
});
router.post('/removeContactFromCompany', passport.authentication,  (req, res) => {
    // const { errors, isValid } = validateCompanyInput(req.body);
    //check Validation
    // if(!isValid) {
    //     return res.status(400).json(errors);
    // }
    /**
     * Input: Must be admin
     * userId
     * companyId
     */
    var bodyData = req.body;
    var jwtPayload = bodyData.jwtPayload;
    if(jwtPayload.userType !== 2 && jwtPayload.userType !== 1){
        return res.status(400).json({success:false, error:"Must be an account manager for this"})
    }
    if(bodyData.userId === jwtPayload.id){
        return res.status(400).json({success:false, error:"Can not remove yourself"})
    }
    postgresdb.tx(t => {
        return t.one('SELECT ec.company_id \
                        FROM company_contact ec \
                        WHERE ec.company_contact_id = ${company_contact_id} AND ec.company_id = ${company_id} AND ec.is_primary',
                        {company_contact_id:jwtPayload.id, company_id:bodyData.companyId})
            .then(()=>{
                return t.none('DELETE FROM company_contact \
                WHERE company_contact_id = ${company_contact_id} AND company_id = ${company_id}',
                {company_contact_id:bodyData.userId, company_id:bodyData.companyId})
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
                res.status(400).json({success: false, error:"Either not with this company, or not an admin"})
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
 * @route POST api/company/setContactAdmin
 * @group company - Company
 * @param {Object} body.optional
 * @returns {object} 200 - An array of user info
 * @returns {Error}  default - Unexpected error
 * @access Private
 */
router.post('/setContactAdmin', passport.authentication,  (req, res) => {
    // const { errors, isValid } = validateCompanyInput(req.body);
    //check Validation
    // if(!isValid) {
    //     return res.status(400).json(errors);
    // }
    /**
     * Input: Must be admin
     * companyContactId
     * isPrimary
     * companyId
     */
    var bodyData = req.body;
    var jwtPayload = bodyData.jwtPayload;
    if(jwtPayload.userType !== 2 && jwtPayload.userType !== 1){
        return res.status(400).json({success:false, error:"Must be an account manager for this"})
    }
    
    var companyContactId = req.body.companyContactId
    if(companyContactId == null)
        return res.status(400).json({success:false, error:"Missing companyContactId field"})
    if(companyContactId == jwtPayload.id)
        return res.status(400).json({success:false, error:"Can't change your own administrator setting"})
    var isPrimary = req.body.isPrimary
    if(isPrimary == null)
        return res.status(400).json({success:false, error:"Missing isPrimary field"})

    postgresdb.tx(t => {
        return t.one('SELECT ec.company_id \
                        FROM company_contact ec \
                        WHERE ec.company_contact_id = ${company_contact_id} AND ec.company_id = ${company_id} AND ec.is_primary',
                        {company_contact_id:jwtPayload.id, company_id:bodyData.companyId})
            .then(()=>{
                return t.none('UPDATE company_contact SET is_primary=${is_primary} WHERE company_contact_id = ${companyContactId}',
                    {is_primary:isPrimary, companyContactId:companyContactId})
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
                res.status(400).json({success: false, error:"Either not with this company, or not an admin"})
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
 * Get company contact list
 * @route GET api/company/getCompanyContactList
 * @group company - Company
 * @param {Object} body.optional
 * @returns {object} 200 - A list of contacts
 * @returns {Error}  default - Unexpected error
 * @access Private
 */
router.get('/getCompanyContactList/:companyId', passport.authentication,  getCompanyContactList)
router.get('/getCompanyContactList/:companyId/:page', passport.authentication,  getCompanyContactList)
function getCompanyContactList(req, res) {
    const jwtPayload = req.body.jwtPayload;
    var companyId = req.params.companyId
    if(jwtPayload.userType !== 2 && jwtPayload.userType != 1){
        return res.status(400).json({success:false, error:"Invalid user"})
    }
    var page = req.params.page;
    if(page == null)
        page = 1;
    postgresdb.tx(t => {
        return t.one('SELECT ec.company_id \
                        FROM company_contact ec \
                        WHERE ec.company_contact_id = ${company_contact_id} AND ec.company_id = ${company_id} AND ec.is_primary',
                        {company_contact_id:jwtPayload.id, company_id:companyId})
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
                    LIMIT 10', {company_id:companyId, page:(page-1)*10})
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
                res.status(400).json({success: false, error:"Either not with this company, or not an admin"})
            });
    })
    .then((data) => { })
    .catch(err => {
        console.log(err)
        res.status(400).json({success: false, error:err})
    });
}

module.exports = router;