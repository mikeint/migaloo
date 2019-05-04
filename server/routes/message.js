const express = require('express');
const router = express.Router();
const passport = require('../config/passport');
const moment = require('moment');

const validateMessageInput = require('../validation/message');  
const db = require('../config/db')
const postgresdb = db.postgresdb
const pgp = db.pgp
const messagesInsertHelper = new pgp.helpers.ColumnSet(['to_id', 'message_subject_id', 'message_type_id', 'message'], {table: 'messages'});
const calendarInsertHelper = new pgp.helpers.ColumnSet(['to_id', 'message_subject_id', 'message_type_id', 'date_offer', 'minute_length', 'location_type', 'meeting_subject'], {table: 'messages'});
// const subjectInsertHelper = new pgp.helpers.ColumnSet(['user_id_1', 'user_id_2', 'message_subject_id', 'post_id'], {table: 'messages'});
/**
 * Create a new message in a conversation, or calendar invite
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
     * toId
     * messageSubjectId
     * message
     * dateOffer
     * minuteLength
     * locationType
     */
    var body = req.body
    const { errors, isValid } = validateMessageInput(body);
    //check Validation
    if(!isValid) {
        return res.status(400).json(errors);
    }
    var jwtPayload = body.jwtPayload;
    var userId = jwtPayload.id;
    var messageType = null;
    if(body.message){ // Chat Message
        messageType = 1;
    }
    if(body.dateOffer){ // Calander Invite
        messageType = 2;
    }
    postgresdb.tx(t => {
        // Get basic data, and ensure they can message, candidate posting must be accepted
        return t.one('\
            SELECT 1 \
            FROM messages_subject m \
            '+(jwtPayload.userType == 2?
                'LEFT JOIN company_contact ec1 ON m.user_id_1 = ec1.company_id \
                LEFT JOIN company_contact ec2 ON m.user_id_2 = ec2.company_id \
            ':'')+
            'WHERE '+(jwtPayload.userType == 1 ? 
                '(m.user_id_1 = ${userId} OR m.user_id_2 = ${userId}) AND m.message_subject_id = ${messageSubjectId}' :
                '(ec1.company_contact_id = ${userId} OR ec2.company_contact_id = ${userId}) AND m.message_subject_id = ${messageSubjectId}')+
            ' \
            LIMIT 1 \
            ', {userId:userId, messageSubjectId:body.messageSubjectId})
        .then((data) => {
            // Ensure the person is in this chain
            const makeMessage = {
                to_id:body.toId,
                message_subject_id:body.messageSubjectId,
                message_type_id: messageType,
                message:body.message,
                date_offer:body.dateOffer,
                minute_length: body.minuteLength,
                location_type: body.locationType,
                meeting_subject: body.subject
            }
            const query = pgp.helpers.insert(makeMessage, messageType===1?messagesInsertHelper:calendarInsertHelper);

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

/**
 * Set response for the calander invide
 * @route POST api/message/setResponse
 * @group messages - Chat Messages
 * @param {Object} body.optional
 * @returns {object} 200 - Success Message
 * @returns {Error}  default - Unexpected error
 * @access Private
 */
router.post('/setResponse', passport.authentication,  (req, res) => {
    const jwtPayload = req.body.jwtPayload;
    const messageId = req.body.messageId;
    const messageSubjectId = req.body.messageSubjectId;
    let response = req.body.response;
    if(response !== 1 && response !== 2)
        return res.status(400).json({success:false, error:"Invalid response"})

    const userId = jwtPayload.id;
    postgresdb.one('\
            SELECT 1 \
            FROM messages_subject ms \
            '+(jwtPayload.userType == 2?
            'LEFT JOIN company_contact ec1 ON ms.user_id_1 = ec1.company_id \
            LEFT JOIN company_contact ec2 ON ms.user_id_2 = ec2.company_id \
            ':'')+
            'WHERE '+(jwtPayload.userType == 1 ? 
                '(ms.user_id_1 = ${userId} OR ms.user_id_2 = ${userId}) AND ms.message_subject_id = $2' :
                '(ec1.company_contact_id = ${userId} OR ec2.company_contact_id = ${userId}) AND ms.message_subject_id = ${messageSubjectId}')+
            ' \
            LIMIT 1', {userId:userId, messageSubjectId:messageSubjectId})
    .then(d=>{ 
        postgresdb.none('UPDATE messages_calander SET response = $1 WHERE message_id_calander = $2', [response, messageId])
        .then((data) => {
            res.json({success:true})
        })
        .catch(err => {
            console.log(err)
            res.status(400).json(err)
        });
    })
    .catch(err => {
        console.log(err)
        res.status(400).json(err)
    });
});
/**
 * List all messages for a user
 * @route POST api/message/list
 * @group message - Chat Messages
 * @param {Object} body.optional
 * @returns {object} 200 - Success Message
 * @returns {Error}  default - Unexpected error
 * @access Private
 */
router.get('/list', passport.authentication, listMessages);
router.get('/list/:page', passport.authentication, listMessages);
function listMessages(req, res){
    var page = req.params.page;
    if(page == null)
        page = 1;
    var jwtPayload = req.body.jwtPayload;
    
    var userId = jwtPayload.id;
    postgresdb.any('\
        SELECT ms.post_id, jpa.title as job_post_title, m.to_id, m.created_on, ms.created_on as subject_created_on, \
            m.message, m.response, m.date_offer, m.has_seen, m.message_id, ms.message_subject_id, \
            umsub.user_type_id as subject_user_type_id, umsub.user_type_name as subject_user_type_name, \
            umsub.user_id as subject_user_id, umsub.first_name as subject_first_name, umsub.last_name as subject_last_name, \
            um1.user_type_name as user_1_type_name, um1.first_name as user_1_first_name, um1.last_name as user_1_last_name, um1.company_name as user_1_company_name, \
            um2.user_type_name as user_2_type_name, um2.first_name as user_2_first_name, um2.last_name as user_2_last_name, um2.company_name as user_2_company_name, \
            ms.user_id_2, ms.user_id_1, \
            (count(1) OVER())/10+1 AS page_count, ${userId} as my_id \
        FROM messages_subject ms \
        LEFT JOIN ( \
            SELECT mo.* \
            FROM ( \
                SELECT ml.message_id, ml.message_subject_id, ml.message, ml.response, ml.date_offer, ml.has_seen, ml.created_on, ml.to_id, \
                ROW_NUMBER() OVER (PARTITION BY message_subject_id, user_id_1, user_id_2 \
                                    ORDER BY created_on DESC) AS rn \
                FROM messages ml \
                WHERE ml.user_id_1 = ${userId} OR ml.user_id_2 = ${userId} \
            ) mo \
            WHERE mo.rn = 1 \
        ) m ON ms.message_subject_id = m.message_subject_id \
        INNER JOIN job_posting_all jpa ON jpa.post_id = ms.post_id \
        INNER JOIN user_master umsub ON umsub.user_id = ms.subject_user_id \
        LEFT JOIN user_master um1 ON um1.user_id = ms.user_id_2 \
        LEFT JOIN user_master um2 ON um2.user_id = ms.user_id_2 \
        '+(jwtPayload.userType == 2?
        'INNER JOIN company_contact cc ON jpa.company_id = cc.company_id \
        ':'\
        INNER JOIN job_recruiter_posting jrp ON jpa.post_id = jrp.post_id \
        ')+
        'WHERE '+(jwtPayload.userType == 2 ? 
            'cc.company_contact_id = ${userId}':
            '(ms.user_id_1 = ${userId} OR ms.user_id_2 = ${userId}) AND jrp.recruiter_id = ${userId} AND jpa.active AND jpa.is_visible')+
        ' \
        ORDER BY coalesce(m.created_on, ms.created_on) DESC \
        OFFSET ${page} \
        LIMIT 10 \
        ', {userId:userId, page:(page-1)*10})
    .then((data) => {
        // Marshal data
        data = data.map(m=>{
            m.toMe = m.to_id == m.my_id;
            let contactName = m.my_id === m.user_id_1?
                (m.user_2_company_name?m.user_2_company_name:(m.user_2_first_name+" "+m.user_2_last_name)):
                (m.user_1_company_name?m.user_1_company_name:(m.user_1_first_name+" "+m.user_1_last_name));
            m.contactName = contactName;

            var dateOfferTimestamp = moment(m.date_offer);
            m.date_offer_str = dateOfferTimestamp.format("LLL");
            timestamp = moment(m.subject_created_on);
            ms = timestamp.diff(moment());
            m.subject_created = moment.duration(ms).humanize() + " ago";
            m.subject_created_on = timestamp.format("x");
            if(m.created_on == null){
                m.created = m.subject_created;
                m.created_on = m.subject_created_on;
            }else{
                var timestamp = moment(m.created_on);
                var ms = timestamp.diff(moment());
                m.created = moment.duration(ms).humanize() + " ago";
                m.created_on = timestamp.format("x");
            }
            return m
        })
        res.json(data)
    })
    .catch(err => {
        console.log(err)
        res.status(400).json(err)
    });
}

/**
 * List all messages for a message chain
 * @route POST api/message/listChain/:chainId
 * @group message - Chat Messages
 * @param {Object} body.optional
 * @returns {object} 200 - Success Message
 * @returns {Error}  default - Unexpected error
 * @access Private
 */
router.get('/listConversationMessages/:message_subject_id', passport.authentication, listConversationMessages);
router.get('/listConversationMessages/:message_subject_id/:page', passport.authentication, listConversationMessages);
function listConversationMessages(req, res){
    var page = req.params.page;
    var messageSubjectId = parseInt(req.params.message_subject_id, 10);
    if(messageSubjectId == null){
        return res.status(400).json({success:false, error:"Missing Message Subject Id"})
    }
    var jwtPayload = req.body.jwtPayload;
    // Validate that the user id of the user is in the requested chain
    var userId = jwtPayload.id;
    if(page == null)
        page = 1;
    postgresdb.any('\
        SELECT m.message_id, ms.post_id, m.to_id, m.created_on, m.responded, \
            m.message, m.has_seen, m.date_offer, m.response, m.minute_length, m.location_type_name, m.meeting_subject, \
            um.user_type_id as subject_user_type_id, um.user_type_name as subject_user_type_name, \
            m.message_subject_id, um.first_name as subject_first_name, m.message_type_id, \
            m.user_id_1, um1.user_type_name as user_1_type_name, um1.first_name as user_1_first_name, um1.last_name as user_1_last_name, um1.company_name as user_1_company_name, \
            m.user_id_2, um2.user_type_name as user_2_type_name, um2.first_name as user_2_first_name, um2.last_name as user_2_last_name, um2.company_name as user_2_company_name, \
            (count(1) OVER())/10+1 AS page_count, '+
            (jwtPayload.userType == 1 ? 
                '${userId} as my_id' :
                'CASE \
                    WHEN ec1.company_id IS NULL AND ec2.company_id IS NOT NULL THEN ec1.company_id \
                    WHEN ec1.company_id IS NOT NULL AND ec2.company_id IS NULL THEN ec2.company_id \
                    ELSE 0 \
                END as my_id')+
            ' \
        FROM messages m \
        INNER JOIN messages_subject ms ON ms.message_subject_id = m.message_subject_id \
        INNER JOIN user_master um ON um.user_id = ms.subject_user_id \
        INNER JOIN user_master um1 ON um1.user_id = m.user_id_1 \
        INNER JOIN user_master um2 ON um2.user_id = m.user_id_2 \
        '+(jwtPayload.userType == 2?
        'LEFT JOIN company_contact ec1 ON ms.user_id_1 = ec1.company_id \
        LEFT JOIN company_contact ec2 ON ms.user_id_2 = ec2.company_id \
        ':'')+
        'WHERE '+(jwtPayload.userType == 1 ? 
            '(ms.user_id_1 = ${userId} OR ms.user_id_2 = ${userId}) AND m.message_subject_id = ${messageSubjectId}' :
            '(ec1.company_contact_id = ${userId} OR ec2.company_contact_id = ${userId}) AND m.message_subject_id = ${messageSubjectId}')+
        ' \
        ORDER BY m.created_on DESC \
        OFFSET ${page} \
        LIMIT 10 \
        ', {userId:userId, messageSubjectId:messageSubjectId, page:(page-1)*10})
    .then((data) => {
        // Marshal data
        data = data.map(m=>{
            m.toMe = m.to_id == m.my_id;
            var dateOfferTimestamp = moment(m.date_offer);
            m.date_offer_str = dateOfferTimestamp.format("LLL");
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
/**
 * Get location types
 * @route GET api/messages/locations
 * @group messages - Chat Messages
 * @returns {object} 200 - A list of maps containing autocompletes
 * @returns {Error}  default - Unexpected error
 * @access Private
 */
router.get('/locations', passport.authentication, (req, res) => {
    postgresdb.any('SELECT location_type_name, location_type_id \
            FROM location_type \
            ORDER BY location_type_id ASC')
    .then(data => {
        res.json({success:true, locationList: data});
    })
    .catch(err => {
        console.log(err)
        res.status(400).json({success:false, error:err})
    });
});

module.exports = router;