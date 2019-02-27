const express = require('express');
const router = express.Router();
const passport = require('../../config/passport');
const moment = require('moment');

const validateMessageInput = require('../../validation/message');  
const db = require('../../config/db')
const postgresdb = db.postgresdb
const pgp = db.pgp
const messagesInsertHelper = new pgp.helpers.ColumnSet(['user_id_1', 'user_id_2', 'to_id', 'subject_user_id', 'post_id', 'subject', 'message'], {table: 'messages'});
/**
 * Create a new message conversation
 * @route POST api/message/create
 * @group message - Chat Messages
 * @param {Object} body.optional
 * @returns {object} 200 - Success Message
 * @returns {Error}  default - Unexpected error
 * @access Private
 */
router.post('/create', passport.authentication,  (req, res) => {
    /**
     * Inputs Body:
     * subject
     * message
     * postId
     * subjectUserId
     * toId
     */
    var body = req.body
    const { errors, isValid } = validateMessageInput(body);
    //check Validation
    if(!isValid) {
        return res.status(400).json(errors);
    }
    var jwtPayload = body.jwtPayload;
    var userId = jwtPayload.employerId?jwtPayload.employerId:jwtPayload.id;
    var userId1 = userId;
    var userId2 = body.toId;
    if(userId1 > userId2){
        var t = userId1;
        userId1 = userId2;
        userId2 = t;
    }
    postgresdb.tx(t => {
        // Get basic data, and ensure they can message, candidate posting must be accepted
        return t.one('\
            SELECT cp.candidate_id, cp.post_id \
            FROM candidate_posting cp \
            INNER JOIN job_posting jp ON cp.post_id = jp.post_id \
            INNER JOIN job_posting_contact jpc ON cp.post_id = jpc.post_id \
            INNER JOIN employer_contact ec ON jp.employer_id = ec.employer_id \
            WHERE cp.accepted AND jpc.post_id = $1 AND cp.candidate_id = $2 AND (ec.employer_contact_id = $3 OR cp.recruiter_id = $3)', [body.postId, body.subjectUserId, jwtPayload.id])
        .then((data) => {
            // Ensure the person is in this chain
            const makeMessage = {
                user_id_1:userId1,
                user_id_2:userId2,
                to_id:body.toId,
                subject_user_id:body.subjectUserId,
                post_id:body.postId,
                subject:body.subject,
                message:body.message
            }
            const query = pgp.helpers.insert(makeMessage, messagesInsertHelper);

            return t.none(query).then(() => {
                res.json({success: true})
            }).catch((err)=>{
                console.log(err)
                return res.status(500).json({success: false, error:err})
            });
        }).catch((err)=>{
            console.log(err)
            return res.status(500).json({success: false, error:err})
        });
    })
    .then(() => {
        
    }).catch((err)=>{
        console.log(err) // Not an admin
        return res.status(500).json({success: false, error:err})
    });
});
// @route       GET api/message/list
// @desc        List all messages for a user
// @access      Private
router.get('/list', passport.authentication, listMessages);
router.get('/list/:page', passport.authentication, listMessages);
function listMessages(req, res){
    var page = req.params.page;
    if(page == null)
        page = 1;
    var jwtPayload = req.body.jwtPayload;
    
    var userId = jwtPayload.employerId?jwtPayload.employerId:jwtPayload.id;
    postgresdb.any('\
        SELECT m.post_id, m.to_id, m.created_on, \
            m.subject, m.message, m.has_seen, \
            um.user_type_id as subject_user_type_id, um.user_type_name  as subject_user_type_name, \
            um.user_id as subject_user_id, um.first_name as subject_first_name, \
            m.user_id_1, um1.first_name as user_1_first_name, um1.last_name as user_1_first_name, um1.company_name as user_1_company_name, \
            m.user_id_2, um2.first_name as user_2_first_name, um2.last_name as user_2_last_name, um2.company_name as user_2_company_name, \
            (count(1) OVER())/10+1 AS page_count, message_count \
        FROM ( \
            SELECT m.user_id_1, m.user_id_2, m.subject_user_id, max(m.message_id) as message_id, count(1) as message_count \
            FROM messages m \
            WHERE m.user_id_1 = $1 OR m.user_id_2 = $1 \
            GROUP BY m.user_id_1, m.user_id_2, m.subject_user_id \
            ORDER BY max(m.created_on) DESC \
            OFFSET $2 \
            LIMIT 10 \
        ) ml \
        INNER JOIN messages m ON m.message_id = ml.message_id \
        INNER JOIN user_master um ON um.user_id = ml.subject_user_id \
        INNER JOIN user_master um1 ON um1.user_id = ml.user_id_1 \
        INNER JOIN user_master um2 ON um2.user_id = ml.user_id_2 \
        ', [userId, (page-1)*10])
    .then((data) => {
        // Marshal data
        data = data.map(m=>{
            m.toMe = m.to_id == userId;
            var timestamp = moment(m.created_on);
            var ms = timestamp.diff(moment());
            m.created = moment.duration(ms).humanize() + " ago";
            m.created_on = timestamp.format("x");
            return m
        })
        res.json(data)
    })
    .catch(err => {
        console.log(err)
        res.status(400).json(err)
    });
}
// @route       GET api/message/listChain/:chainId
// @desc        List all messages for a message chain
// @access      Private
router.get('/listConversationMessages/:user_id_1/:user_id_2/:subject_user_id', passport.authentication, listConversationMessages);
router.get('/listConversationMessages/:user_id_1/:user_id_2/:subject_user_id/:page', passport.authentication, listConversationMessages);
function listConversationMessages(req, res){
    var page = req.params.page;
    var userId1 = parseInt(req.params.user_id_1, 10);
    var userId2 = parseInt(req.params.user_id_2, 10);
    var subjectUserId = parseInt(req.params.subject_user_id, 10);
    if(userId1 == null){
        return res.status(400).json({success:false, error:"Missing User ID 1"})
    }
    if(userId2 == null){
        return res.status(400).json({success:false, error:"Missing User ID 2"})
    }
    if(subjectUserId == null){
        return res.status(400).json({success:false, error:"Missing Subject User ID"})
    }
    // Enforce user id 1 being less than 2
    if(userId1 > userId2){
        var t = userId1;
        userId1 = userId2;
        userId2 = t;
    }
    var jwtPayload = req.body.jwtPayload;
    // Validate that the user id of the user is in the requested chain
    var userId = jwtPayload.employerId?jwtPayload.employerId:jwtPayload.id;
    if(userId != userId1 && userId != userId2){
        return res.status(400).json({success:false, error:"You are not able to view this message chain"})
    }
    if(page == null)
        page = 1;

    postgresdb.any('\
        SELECT m.message_id, m.post_id, m.to_id, m.created_on, \
            m.subject, m.message, m.has_seen, \
            um.user_type_id as subject_user_type_id, um.user_type_name as subject_user_type_name, \
            um.user_id as subject_user_id, um.first_name as subject_first_name, \
            m.user_id_1, um1.user_type_name as user_1_type_name, um1.first_name as user_1_first_name, um1.last_name as user_1_last_name, um1.company_name as user_1_company_name, \
            m.user_id_2, um2.user_type_name as user_2_type_name, um2.first_name as user_2_first_name, um2.last_name as user_2_last_name, um2.company_name as user_2_company_name, \
            (count(1) OVER())/10+1 AS page_count \
        FROM messages m \
        INNER JOIN user_master um ON um.user_id = m.subject_user_id \
        INNER JOIN user_master um1 ON um1.user_id = m.user_id_1 \
        INNER JOIN user_master um2 ON um2.user_id = m.user_id_2 \
        WHERE m.user_id_1 = $1 AND m.user_id_2 = $2 AND m.subject_user_id = $3 \
        ORDER BY m.created_on DESC \
        OFFSET $4 \
        LIMIT 10 \
        ', [userId1, userId2, subjectUserId, (page-1)*10])
    .then((data) => {
        // Marshal data
        data = data.map(m=>{
            m.toMe = m.to_id == userId;
            var timestamp = moment(m.created_on);
            var ms = timestamp.diff(moment());
            m.created = moment.duration(ms).humanize() + " ago";
            m.created_on = timestamp.format("x");
            return m
        })
        res.json(data)
    })
    .catch(err => {
        console.log(err)
        res.status(400).json(err)
    });
}

module.exports = router;