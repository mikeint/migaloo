const express = require('express');
const router = express.Router();
const passport = require('../utils/passport');
const moment = require('moment');
const address = require('../utils/address')
//load input validation
const logger = require('../utils/logging');

const db = require('../utils/db')
const postgresdb = db.postgresdb
const pgp = db.pgp
const camelColumnConfig = db.camelColumnConfig

/**
 * Add more items to the current plan and extend the subscription
 * @route POST api/plan/addToPlan
 * @group plan - Plan
 * @param {Object} body.optional
 * @returns {object} 200 - An array of user info
 * @returns {Error}  default - Unexpected error
 * @access Private
 */
router.post('/addToPlan', passport.authentication,  (req, res) => {
    /**
     * planId
     * companyId
     * subscriptionValue
     */
    const body = req.body;
    const jwtPayload = body.jwtPayload;
    const userType = jwtPayload.userType;
    if(userType !== 2){
        const errorMessage = "Invalid User Type"
        logger.error('Route Params Mismatch', {tags:['validation'], url:req.originalUrl, userId:jwtPayload.id, body: req.body, params: req.params, error:errorMessage});
        return res.status(400).json({success:false, error:errorMessage})
    }

    postgresdb.tx(t => {
        return t.one('SELECT 1 \
                        FROM company_contact ec \
                        INNER JOIN company c ON ec.company_id = c.company_id \
                        WHERE c.active AND ec.company_contact_id = ${companyContactId} AND ec.company_id = ${companyId}',
                        {companyContactId:jwtPayload.id, companyId:body.companyId})
            .then(()=>{
                return t.one('SELECT 1 \
                                FROM plan p \
                                WHERE p.plan_id = ${planId} AND p.company_id = ${companyId}',
                                {planId:body.planId, companyId:body.companyId})
            }).then(()=>{
                logger.info('Update Plan', {tags:['plan', 'addition'], userId:jwtPayload.id, body:req.body});
                return t.none('UPDATE plan p SET subscription_remaining=p.subscription_remaining + ${subscriptionValue},\
                    subscription_expiry=p.subscription_expiry + interval \'1\' year \
                    WHERE p.plan_id = ${planId}', {planId: body.planId, subscriptionValue: body.subscriptionValue})
            }).then(()=>{
                return res.json({success:true})
            }).catch((err)=>{
                logger.error('Plan SQL Call Failed', {tags:['sql'], url:req.originalUrl, userId:jwtPayload.id, error:err.message || err, body:req.body});
                return res.status(500).json({success: false, error:err})
            });
    }).catch((err)=>{
        logger.error('Plan SQL Call Failed', {tags:['sql'], url:req.originalUrl, userId:jwtPayload.id, error:err.message || err, body:req.body});
        return res.status(500).json({success: false, error:err})
    });
});
/**
 * Add more items to the current plan and extend the subscription
 * @route POST api/plan/setPlan
 * @group plan - Plan
 * @param {Object} body.optional
 * @returns {object} 200 - An array of user info
 * @returns {Error}  default - Unexpected error
 * @access Private
 */
router.post('/setPlan', passport.authentication,  (req, res) => {
    /**
     * companyId
     * planTypeId
     * subscriptionValue
     */
    const body = req.body;
    const jwtPayload = body.jwtPayload;
    const userType = jwtPayload.userType;
    if(userType !== 2){
        const errorMessage = "Invalid User Type"
        logger.error('Route Params Mismatch', {tags:['validation'], url:req.originalUrl, userId:jwtPayload.id, body: req.body, params: req.params, error:errorMessage});
        return res.status(400).json({success:false, error:errorMessage})
    }

    postgresdb.tx(t => {
        return t.one('SELECT p.plan_id \
                        FROM company_contact ec \
                        INNER JOIN company c ON ec.company_id = c.company_id \
                        LEFT JOIN plan p ON p.company_id = c.company_id \
                        WHERE c.active AND ec.company_contact_id = ${companyContactId} AND ec.company_id = ${companyId}',
                        {companyContactId:jwtPayload.id, companyId:body.companyId})
            .then((plan_ret)=>{
                if(plan_ret.plan_id == null)
                    return Promise.resolve();
                return t.none('UPDATE plan SET company_id=null WHERE plan_id=${planId}', 
                    {planId:plan_ret.plan_id})
            }).then(()=>{
                logger.info('Set Plan', {tags:['plan', 'set'], userId:jwtPayload.id, body:req.body});
                return t.one('INSERT INTO plan (subscription_remaining, subscription_value, subscription_expiry, company_id, plan_type_id) \
                    VALUES (${subscriptionValue}, ${subscriptionValue}, NOW() + interval \'1\' year, ${companyId}, ${planTypeId}) RETURNING plan_id', 
                    {companyId:body.companyId, planTypeId:body.planTypeId, subscriptionValue: body.subscriptionValue})
            }).then((plan_ret)=>{
                return res.json({success:true, planId:plan_ret.plan_id})
            }).catch((err)=>{
                logger.error('Plan SQL Call Failed', {tags:['sql'], url:req.originalUrl, userId:jwtPayload.id, error:err.message || err, body:req.body});
                return res.status(500).json({success: false, error:err})
            });
    }).catch((err)=>{
        logger.error('Plan SQL Call Failed', {tags:['sql'], url:req.originalUrl, userId:jwtPayload.id, error:err.message || err, body:req.body});
        return res.status(500).json({success: false, error:err})
    });
});

module.exports = router;