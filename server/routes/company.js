const express = require('express');
const router = express.Router();
const passport = require('../config/passport');
const moment = require('moment');
const invite = require('../utils/invite')
const address = require('../utils/address')
//load input validation
const validateCompanyInput = require('../validation/company');  
const logger = require('../utils/logging');

const db = require('../config/db')
const postgresdb = db.postgresdb
const pgp = db.pgp
const camelColumnConfig = db.camelColumnConfig
const companyFields = ['company_name', 'department', 'image_id', 'address_id', 'company_type'];
const companyInsert = new pgp.helpers.ColumnSet(['company_id', 'company_name', 'department', 'address_id', 'company_type'].map(camelColumnConfig), {table: 'company'});
const companyUpdate = new pgp.helpers.ColumnSet(['?company_id', ...companyFields.map(camelColumnConfig)], {table: 'company'});

const generateUploadMiddleware = require('../utils/upload').generateUploadMiddleware
const upload = generateUploadMiddleware('profile_image/')

const generateImageFileNameAndValidation = (req, res, next) => {
    // Validate this candidate is with this recruiter
    var jwtPayload = req.body.jwtPayload;
    if(jwtPayload.userType != 2){
        const errorMessage = "Invalid User Type"
        logger.error('Route Params Mismatch', {tags:['validation'], url:req.originalUrl, userId:jwtPayload.id, body: req.body, params: req.params, error:errorMessage});
        return res.status(400).json({success:false, error:errorMessage})
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
router.post('/uploadImage/:companyId', passport.authentication, generateImageFileNameAndValidation, upload.any('filepond'), (req, res) => {
    var jwtPayload = req.params.jwtPayload;
    postgresdb.none('UPDATE company SET image_id=$1 WHERE company_id = $2', [req.params.finalFileName, req.params.companyId])
    .then((data) => {
        res.json({success:true, imageId:req.params.finalFileName})
    })
    .catch(err => {
        logger.error('Employer SQL Call Failed', {tags:['sql'], url:req.originalUrl, userId:jwtPayload.id, error:err.message || err, body:req.body});
        res.status(500).json({success:false, error:err})
    });
});

/**
 * List company accounts
 * @route GET api/company/list
 * @group company - Company
 * @param {Object} body.optional
 * @returns {object} 200 - A map of profile information
 * @returns {Error}  default - Unexpected error
 * @access Private
 */
router.get('/list', passport.authentication, list)
router.get('/get/:companyId', passport.authentication, list)
function list(req, res) {
    const jwtPayload = req.body.jwtPayload
    const companyId = req.params.companyId

    if(jwtPayload.userType !== 2 && jwtPayload.userType !== 1){
        const errorMessage = "Invalid User Type"
        logger.error('Route Params Mismatch', {tags:['validation'], url:req.originalUrl, userId:jwtPayload.id, body: req.body, params: req.params, error:errorMessage});
        return res.status(400).json({success:false, error:errorMessage})
    }
    
    postgresdb.any('\
        SELECT \
            c.company_name, c.department, c.image_id, a.*, ec.is_primary, p.*, pt.plan_type_name, \
            ec.company_id as company_id \
        FROM login l \
        INNER JOIN company_contact ec ON ec.company_contact_id = l.user_id \
        INNER JOIN company c ON c.company_id = ec.company_id \
        LEFT JOIN plan p ON p.company_id = ec.company_id \
        LEFT JOIN plan_type pt ON pt.plan_type_id = p.plan_type_id \
        LEFT JOIN address a ON a.address_id = c.address_id \
        WHERE c.active AND ec.company_contact_id = ${userId} '+(companyId!=null?'AND c.company_id = ${companyId}':'')+' \
        ORDER BY ec.is_primary DESC, company_name', {userId:jwtPayload.id, companyId:companyId})
    .then((data) => {
        res.json({success:true, companies:data.map(db.camelizeFields).map(address.convertFieldsToMap).map(d=>{
            var subscriptionExpiry = moment(data.subscriptionExpiry);
            var subscriptionIntitial = moment(data.subscriptionIntitial);
            d.subscriptionExpiry = subscriptionExpiry.format("YYYY-MM-DD");
            d.subscriptionIntitial = subscriptionIntitial.format("YYYY-MM-DD");
            return d;
        })})
    })
    .catch(err => {
        logger.error('Company SQL Call Failed', {tags:['sql'], url:req.originalUrl, userId:jwtPayload.id, error:err.message || err, body:req.body});
        res.status(500).json({success:false, error:err})
    });
}
router.get('/listUnassignedEmployer', passport.authentication, listUnassigned)
router.get('/getUnassignedEmployer/:companyId', passport.authentication, listUnassigned)
function listUnassigned(req, res) {
    const jwtPayload = req.body.jwtPayload
    const companyId = req.params.companyId

    if(jwtPayload.userType !== 2 && jwtPayload.userType !== 1){
        const errorMessage = "Invalid User Type"
        logger.error('Route Params Mismatch', {tags:['validation'], url:req.originalUrl, userId:jwtPayload.id, body: req.body, params: req.params, error:errorMessage});
        return res.status(400).json({success:false, error:errorMessage})
    }
    
    postgresdb.any('\
        SELECT \
            c.company_name, c.department, c.image_id, a.*, p.*, pt.plan_type_name, \
            c.company_id as company_id \
        FROM login l \
        INNER JOIN company c ON c.company_id = l.user_id \
        LEFT JOIN plan p ON p.company_id = c.company_id \
        LEFT JOIN plan_type pt ON pt.plan_type_id = p.plan_type_id \
        LEFT JOIN address a ON a.address_id = c.address_id \
        WHERE c.active AND \
            NOT EXISTS ( \
                SELECT 1 \
                FROM login l \
                INNER JOIN company_contact ec ON ec.company_contact_id = l.user_id \
                WHERE l.user_type_id = ${userType} AND ec.company_id = c.company_id AND ec.is_primary \
            ) AND c.company_type = 1 \
        '+(companyId!=null?'AND c.company_id = ${companyId}':'')+' \
        ORDER BY company_name', {userId:jwtPayload.id, companyId:companyId, userType:jwtPayload.userType})
    .then((data) => {
        res.json({success:true, companies:data.map(db.camelizeFields).map(address.convertFieldsToMap)})
    })
    .catch(err => {
        logger.error('Company SQL Call Failed', {tags:['sql'], url:req.originalUrl, userId:jwtPayload.id, error:err.message || err, body:req.body});
        res.status(500).json({success:false, error:err})
    });
}

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
        return res.status(400).json({success:false, errors:errors});
    }
    var body = req.body;
    var jwtPayload = body.jwtPayload;
    if(jwtPayload.userType != 2){
        const errorMessage = "Invalid User Type"
        logger.error('Route Params Mismatch', {tags:['validation'], url:req.originalUrl, userId:jwtPayload.id, body: req.body, params: req.params, error:errorMessage});
        return res.status(400).json({success:false, error:errorMessage})
    }
    if(body.address == null) body.address = {}
    var companyId
    postgresdb.tx(t => {
        // creating a sequence of transaction queries:
        return address.addAddress(body.address, t)
        .then((addr_ret)=>{
            return t.one('INSERT INTO login(user_type_id) VALUES (4) RETURNING user_id')
            .then((user_ret) => {
                companyId = user_ret.user_id
                const q3 = t.none(pgp.helpers.insert({...body, companyId:companyId, addressId:addr_ret.address_id, companyType: 1}, companyInsert))
                const q4 = t.none('INSERT INTO company_contact(company_id, company_contact_id, is_primary) VALUES ($1, $2, true)',
                                [companyId, jwtPayload.id]);
                return t.batch([q3, q4])
                    .then(() => {
                        res.status(200).json({companyId:companyId, success: true})
                        return []
                    })
            })
        })
    }).catch((err)=>{
        logger.error('Company SQL Call Failed', {tags:['sql'], url:req.originalUrl, userId:jwtPayload.id, error:err.message || err, body:{...req.body, companyId:companyId}});
        return res.status(500).json({success: false, error:err})
    });
});
/**
 * Delete company account
 * @route POST api/company/deleteCompany
 * @group company - Company
 * @param {Object} body.optional
 * @returns {object} 200 - An array of user info
 * @returns {Error}  default - Unexpected error
 * @access Private
 */
router.post('/deleteCompany', passport.authentication,  (req, res) => {
    /**
     * Inputs:
     * companyId
     */
    var body = req.body;
    var jwtPayload = body.jwtPayload;
    if(jwtPayload.userType != 2){
        const errorMessage = "Invalid User Type"
        logger.error('Route Params Mismatch', {tags:['validation'], url:req.originalUrl, userId:jwtPayload.id, body: req.body, params: req.params, error:errorMessage});
        return res.status(400).json({success:false, error:errorMessage})
    }
    if(body.companyId == null){
        const errorMessage = "Missing parameter companyId"
        logger.error('Route Params Mismatch', {tags:['validation'], url:req.originalUrl, userId:jwtPayload.id, body: req.body, params: req.params, error:errorMessage});
        return res.status(400).json({success:false, error:errorMessage})
    }
    
    postgresdb.tx(t => {
        return t.one('SELECT ec.company_id, c.company_name \
                        FROM company_contact ec \
                        INNER JOIN company c ON ec.company_id = c.company_id \
                        WHERE c.active AND ec.company_contact_id = ${companyContactId} AND ec.company_id = ${companyId} AND ec.is_primary',
                        {companyContactId:jwtPayload.id, companyId:body.companyId})
        .then(()=>{
            return t.none('UPDATE company SET active=false WHERE company_id = ${companyId}', {companyId:body.companyId})
        }).then(()=>{
            return t.any('SELECT l.user_id \
                FROM login l \
                INNER JOIN company_contact ec ON l.user_id = ec.company_contact_id \
                WHERE ec.company_id = ${companyId}',
                {companyId:body.companyId})
        }).then((userIds) => {
            userIds = userIds.map(d=>d.user_id)
            return t.none('DELETE FROM access_token WHERE user_id in (${userIds:csv})',
                {userIds:userIds})
        }).then(() => {
            return res.status(200).json({success: true})
        })
    })
    .catch((err)=>{
        logger.error('Company SQL Call Failed', {tags:['sql'], url:req.originalUrl, userId:jwtPayload.id, error:err.message || err, body:req.body});
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
        return res.status(400).json({success:false, errors:errors});
    }
    var body = req.body;
    var jwtPayload = body.jwtPayload;
    if(jwtPayload.userType !== 2 && jwtPayload.userType !== 1){
        const errorMessage = "Invalid User Type"
        logger.error('Route Params Mismatch', {tags:['validation'], url:req.originalUrl, userId:jwtPayload.id, body: req.body, params: req.params, error:errorMessage});
        return res.status(400).json({success:false, error:errorMessage})
    }
    if(body.address == null) body.address = {}
    postgresdb.tx(t => {
        var addressId = body.address.addressId;
        // creating a sequence of transaction queries:
        var q1
        if(addressId == null){
            q1 = address.addAddress(body.address, t)
        }else{
            q1 = Promise.resolve({address_id:addressId})
        }
        return q1.then((addr_ret)=>{
            addressId = addressId != null ? addressId : addr_ret.address_id
            const q2 = t.none(pgp.helpers.update({...body, addressId:addr_ret.address_id}, companyUpdate, null, {emptyUpdate:true}) + ' WHERE company_id = ${companyId}', {companyId: body.companyId})
            return q2
                .then(() => {
                    res.status(200).json({success: true})
                    return []
                })
        })
    }).catch((err)=>{
        logger.error('Company SQL Call Failed', {tags:['sql'], url:req.originalUrl, userId:jwtPayload.id, error:err.message || err, body:req.body});
        return res.status(500).json({success: false, error:err})
    });
});

const companyContactHelper = new pgp.helpers.ColumnSet(['company_contact_id', 'company_id', 'is_primary'], {table: 'company_contact'});
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
    //     return res.status(400).json({success:false, errors:errors});
    // }
    /**
     * Input: Must be admin, either use emails field or userIds field, cannot use both
     * userIds <list> (-1 is your own id)
     * emails <list>
     * companyId
     */
    const body = req.body;
    const jwtPayload = body.jwtPayload;
    const userType = jwtPayload.userType;
    if(userType !== 2 && userType !== 1){
        const errorMessage = "Invalid User Type"
        logger.error('Route Params Mismatch', {tags:['validation'], url:req.originalUrl, userId:jwtPayload.id, body: req.body, params: req.params, error:errorMessage});
        return res.status(400).json({success:false, error:errorMessage})
    }
    if(body.userIds)
        body.userIds = body.userIds.map(id=>id===-1?jwtPayload.id:id)

    postgresdb.tx(t => {
        return t.one('SELECT c.company_id, c.company_name, \
                        COUNT(DISTINCT ec.company_contact_id) as contacts, \
                        MAX(CASE WHEN ec.company_contact_id = ${company_contact_id} AND ec.is_primary THEN 1 ELSE 0 END) as i_am_primary, \
                        MAX(CASE WHEN ec.company_contact_id = ${company_contact_id} THEN 1 ELSE 0 END) as i_am_a_contact, \
                        SUM(CASE WHEN l.user_type_id = 2 THEN 1 ELSE 0 END) as account_manager_count, \
                        BOOL_AND(CASE WHEN l.user_type_id = 2 AND ec.is_primary THEN true ELSE false END) as has_primary_account \
                    FROM company c \
                    INNER JOIN company_contact ec ON ec.company_id = c.company_id \
                    INNER JOIN login l ON ec.company_contact_id = l.user_id \
                    WHERE c.active AND l.active AND ec.company_id = ${company_id} \
                    GROUP BY c.company_id, c.company_name',
                    {company_contact_id:jwtPayload.id, company_id:body.companyId})
            .then((user_ret)=>{
                if(user_ret.i_am_primary != 1){
                    if(userType === 1){
                        throw new Error("User is not contact for this company")
                    }
                    else if(userType === 2 && !user_ret.has_primary_account){
                        if(user_ret.i_am_a_contact){
                            // I am a contact but not an admin, and there is no admins
                            return t.none('UPDATE company_contact SET is_primary=true WHERE company_contact_id = ${companyContactId}',
                                {companyContactId:jwtPayload.id})
                            .then(()=>{
                                // TODO: send request email to contact to make a password
                                res.status(200).json({success: true, addedCount: 1})
                                return []
                            })
                        }
                        // Pass, no user has been assigned to the company or there is no primary, so allow people to add anyone
                    }else{
                        throw new Error("User is not contact for this company")
                    }
                }
                return new Promise((resolve, reject)=>{
                    if(body.userIds){
                        const data = body.userIds.map(id=>{
                            return {
                                company_contact_id: id,
                                company_id: body.companyId,
                                is_primary: id == jwtPayload.id
                            }
                        })
                        return resolve(data)
                    }else{
                        return t.any('SELECT l.user_id, l.email, cc.company_id \
                                FROM login l \
                                LEFT JOIN company_contact cc ON cc.company_contact_id = l.user_id \
                                WHERE l.email in (${emails:csv}) AND l.user_type_id = ${userType}',
                                {emails:body.emails, type:userType})
                        .then((users)=>{
                            const alreadyExists = users.filter(d=>d.company_id == body.companyId).map(d=>d.email)
                            const availableToJoin = users.filter(d=>d.company_id == null).map(d=>d.user_id)
                            const usersToAsk = body.emails.filter(d=>!alreadyExists.includes(d)).filter(d=>!availableToJoin.includes(d))
                            if(leftOvers.length > 0 && usersToAsk.length > 0){
                                invite.inviteByEmails(usersToAsk, userType, company).then(userIds=>{
                                    // Going to skip force adding people for now
                                })
                            }
                            const data = availableToJoin.map(id=>{
                                return {
                                    company_contact_id: id,
                                    company_id: body.companyId,
                                    is_primary: id == jwtPayload.id
                                }
                            })
                            return resolve(data)
                        })
                        .catch(reject)
                    }
                }).then(data=>{
                    if(data.length > 0){
                        const query = pgp.helpers.insert(data, companyContactHelper);
                        return t.none(query)
                        .then(()=>{
                            // TODO: send request email to contact to make a password
                            res.status(200).json({success: true, addedCount: data.length})
                            return []
                        })
                    }else{
                        res.status(200).json({success: true, addedCount: data.length})
                        return []
                    }
                })
            })
    }).catch((err)=>{
        logger.error('Company SQL Call Failed', {tags:['sql'], url:req.originalUrl, userId:jwtPayload.id, error:err.message || err, body:req.body});
        return res.status(500).json({success: false, error:err})
    });
});
router.post('/removeContactFromCompany', passport.authentication,  (req, res) => {
    // const { errors, isValid } = validateCompanyInput(req.body);
    //check Validation
    // if(!isValid) {
    //     return res.status(400).json({success:false, errors:errors});
    // }
    /**
     * Input: Must be admin
     * userId
     * companyId
     */
    var body = req.body;
    var jwtPayload = body.jwtPayload;
    if(jwtPayload.userType !== 2 && jwtPayload.userType !== 1){
        const errorMessage = "Invalid User Type"
        logger.error('Route Params Mismatch', {tags:['validation'], url:req.originalUrl, userId:jwtPayload.id, body: req.body, params: req.params, error:errorMessage});
        return res.status(400).json({success:false, error:errorMessage})
    }
    if(body.userId === jwtPayload.id){
        const errorMessage = "Can not remove yourself"
        logger.error('Route Params Mismatch', {tags:['validation'], url:req.originalUrl, userId:jwtPayload.id, body: req.body, params: req.params, error:errorMessage});
        return res.status(400).json({success:false, error:errorMessage})
    }
    postgresdb.tx(t => {
        return t.one('SELECT ec.company_id \
                        FROM company_contact ec \
                        WHERE ec.company_contact_id = ${company_contact_id} AND ec.company_id = ${company_id} AND ec.is_primary',
                        {company_contact_id:jwtPayload.id, company_id:body.companyId})
            .then(()=>{
                return t.none('DELETE FROM company_contact \
                WHERE company_contact_id = ${company_contact_id} AND company_id = ${company_id}',
                {company_contact_id:body.userId, company_id:body.companyId})
                .then(()=>{
                    // TODO: send request email to contact to make a password
                    res.status(200).json({success: true})
                    return []
                })
            })
    }).catch((err)=>{
        logger.error('Company SQL Call Failed', {tags:['sql'], url:req.originalUrl, userId:jwtPayload.id, error:err.message || err, body:req.body});
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
    //     return res.status(400).json({success:false, errors:errors});
    // }
    /**
     * Input: Must be admin
     * companyContactId
     * isPrimary
     * companyId
     */
    var body = req.body;
    var jwtPayload = body.jwtPayload;
    if(jwtPayload.userType !== 2 && jwtPayload.userType !== 1){
        const errorMessage = "Invalid User Type"
        logger.error('Route Params Mismatch', {tags:['validation'], url:req.originalUrl, userId:jwtPayload.id, body: req.body, params: req.params, error:errorMessage});
        return res.status(400).json({success:false, error:errorMessage})
    }
    
    var companyContactId = req.body.companyContactId
    if(companyContactId == null){
        const errorMessage = "Missing companyContactId field"
        logger.error('Route Params Mismatch', {tags:['validation'], url:req.originalUrl, userId:jwtPayload.id, body: req.body, params: req.params, error:errorMessage});
        return res.status(400).json({success:false, error:errorMessage})
    }
    var isPrimary = req.body.isPrimary
    if(companyContactId == jwtPayload.id && !isPrimary){
        const errorMessage = "Can't change your own administrator setting"
        logger.error('Route Params Mismatch', {tags:['validation'], url:req.originalUrl, userId:jwtPayload.id, body: req.body, params: req.params, error:errorMessage});
        return res.status(400).json({success:false, error:errorMessage})
    }
    if(isPrimary == null){
        const errorMessage = "Missing isPrimary field"
        logger.error('Route Params Mismatch', {tags:['validation'], url:req.originalUrl, userId:jwtPayload.id, body: req.body, params: req.params, error:errorMessage});
        return res.status(400).json({success:false, error:errorMessage})
    }

    postgresdb.tx(t => {
        return t.one('SELECT c.company_id, c.company_name, \
                        COUNT(DISTINCT ec.company_contact_id) as contacts, \
                        MAX(CASE WHEN ec.company_contact_id = ${company_contact_id} AND ec.is_primary THEN 1 ELSE 0 END) as i_am_primary, \
                        MAX(CASE WHEN ec.company_contact_id = ${company_contact_id} THEN 1 ELSE 0 END) as i_am_a_contact, \
                        SUM(CASE WHEN l.user_type_id = 2 THEN 1 ELSE 0 END) as account_manager_count \
                    FROM company c \
                    INNER JOIN company_contact ec ON ec.company_id = c.company_id \
                    INNER JOIN login l ON ec.company_contact_id = l.user_id \
                    WHERE c.active AND l.active AND ec.company_id = ${company_id} \
                    GROUP BY c.company_id, c.company_name',
                    {company_contact_id:jwtPayload.id, company_id:body.companyId})
            .then((user_ret)=>{
                if(user_ret.i_am_primary != 1){
                    if(userType === 1){
                        throw new Error("User is not contact for this company")
                    }
                    else if(userType === 2 && user_ret.account_manager_count == 0){
                        // Pass, no user has been assigned to the company or there is no primary, so open it up to anyone to manage
                    }else{
                        throw new Error("User is not contact for this company")
                    }
                }
                return t.none('UPDATE company_contact SET is_primary=${is_primary} WHERE company_contact_id = ${companyContactId}',
                    {is_primary:isPrimary, companyContactId:companyContactId})
                .then(()=>{
                    // TODO: send request email to contact to make a password
                    res.status(200).json({success: true})
                    return []
                })
            })
    }).catch((err)=>{
        logger.error('Company SQL Call Failed', {tags:['sql'], url:req.originalUrl, userId:jwtPayload.id, error:err.message || err, body:req.body});
        return res.status(500).json({success: false, error:err})
    });
});

/**
 * Get company contact list
 * @route GET api/company/getCompanyAccountManagerList
 * @group company - Company
 * @param {Object} body.optional
 * @returns {object} 200 - A list of contacts
 * @returns {Error}  default - Unexpected error
 * @access Private
 */
router.get('/getCompanyAccountManagerList/:companyId', passport.authentication, getCompanyAccountManagerList)
router.get('/getCompanyAccountManagerList/:companyId/:page', passport.authentication, getCompanyAccountManagerList)
function getCompanyAccountManagerList(req, res) {
    const jwtPayload = req.body.jwtPayload;
    var companyId = req.params.companyId
    if(jwtPayload.userType !== 2 && jwtPayload.userType !== 3){
        const errorMessage = "Invalid User Type"
        logger.error('Route Params Mismatch', {tags:['validation'], url:req.originalUrl, userId:jwtPayload.id, body: req.body, params: req.params, error:errorMessage});
        return res.status(400).json({success:false, error:errorMessage})
    }
    var page = req.params.page;
    if(page == null || page < 1)
        page = 1;
    postgresdb.tx(t => {
        var promise
        if(jwtPayload.userType === 2){ // If account manager
            promise = Promise.resolve()
        }else{
            promise = t.one('SELECT ec.company_id \
                            FROM company_contact ec \
                            WHERE ec.company_contact_id = ${company_contact_id} AND ec.company_id = ${company_id}',
                            {company_contact_id:jwtPayload.id, company_id:companyId})
        }
        return promise.then(()=>{
                return t.any('\
                    SELECT ec.company_contact_id, um.email, um.first_name, um.last_name, \
                        um.phone_number, um.image_id, um.created_on, ec.is_primary, \
                        um.account_active, \
                        (count(1) OVER())/10+1 as "pageCount" \
                    FROM company_contact ec \
                    INNER JOIN user_master um ON ec.company_contact_id = um.user_id \
                    WHERE ec.company_id = ${company_id} AND um.active AND um.user_type_id = 2 \
                    ORDER BY NOT ec.is_primary, um.last_name ASC, um.first_name ASC \
                    OFFSET ${page} \
                    LIMIT 10', {company_id:companyId, page:(page-1)*10})
                .then((data) => {
                    // Marshal data
                    data = data.map(db.camelizeFields).map(m=>{
                        m.isMe = (jwtPayload.id === m.companyContactId);
                        var timestamp = moment(m.createdOn);
                        var ms = timestamp.diff(moment());
                        m.created = moment.duration(ms).humanize() + " ago";
                        m.createdOn = timestamp.format("x");
                        return m
                    })
                    res.json({success: true, contactList:data})
                })
            })
    })
    .catch(err => {
        logger.error('Company SQL Call Failed', {tags:['sql'], url:req.originalUrl, userId:jwtPayload.id, error:err.message || err, body:req.body});
        res.status(500).json({success: false, error:err})
    });
}
/**
 * Get company contact list
 * @route GET api/company/getCompanyContactList
 * @group company - Company
 * @param {Object} body.optional
 * @returns {object} 200 - A list of contacts
 * @returns {Error}  default - Unexpected error
 * @access Private
 */
router.get('/getCompanyContactList/:companyId', passport.authentication, getCompanyContactList)
router.get('/getCompanyContactList/:companyId/:page', passport.authentication, getCompanyContactList)
function getCompanyContactList(req, res) {
    const jwtPayload = req.body.jwtPayload;
    var companyId = req.params.companyId
    if(jwtPayload.userType !== 2 && jwtPayload.userType != 1){
        const errorMessage = "Invalid User Type"
        logger.error('Route Params Mismatch', {tags:['validation'], url:req.originalUrl, userId:jwtPayload.id, body: req.body, params: req.params, error:errorMessage});
        return res.status(400).json({success:false, error:errorMessage})
    }
    var page = req.params.page;
    if(page == null || page < 1)
        page = 1;
    postgresdb.tx(t => {
        var promise
        if(jwtPayload.userType === 2){ // If account manager
            promise = Promise.resolve()
        }else{
            promise = t.one('SELECT ec.company_id \
                            FROM company_contact ec \
                            WHERE ec.company_contact_id = ${company_contact_id} AND ec.company_id = ${company_id}',
                            {company_contact_id:jwtPayload.id, company_id:companyId})
        }
        return promise.then(()=>{
                return t.any('\
                    SELECT ec.company_contact_id, um.email, um.first_name, um.last_name, um.user_type_id, \
                        um.phone_number, um.image_id, um.created_on, ec.is_primary, \
                        um.account_active, CASE WHEN access_token IS NOT NULL THEN TRUE ELSE FALSE END as has_access_token, \
                        (count(1) OVER())/10+1 as "pageCount" \
                    FROM company_contact ec \
                    INNER JOIN user_master um ON ec.company_contact_id = um.user_id \
                    LEFT JOIN access_token at ON um.user_id = at.user_id \
                    WHERE ec.company_id = ${company_id} AND um.active AND (um.user_type_id = 3 OR um.user_type_id = 1) \
                    ORDER BY um.last_name ASC, um.first_name ASC \
                    OFFSET ${page} \
                    LIMIT 10', {company_id:companyId, page:(page-1)*10})
                .then((data) => {
                    // Marshal data
                    data = data.map(db.camelizeFields).map(m=>{
                        m.isMe = (jwtPayload.id === m.companyContactId);
                        var timestamp = moment(m.createdOn);
                        var ms = timestamp.diff(moment());
                        m.created = moment.duration(ms).humanize() + " ago";
                        m.createdOn = timestamp.format("x");
                        return m
                    })
                    res.json({success: true, contactList:data})
                })
            })
    })
    .catch(err => {
        logger.error('Company SQL Call Failed', {tags:['sql'], url:req.originalUrl, userId:jwtPayload.id, error:err.message || err, body:req.body});
        res.status(500).json({success: false, error:err})
    });
}

module.exports = router;