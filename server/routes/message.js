const express = require('express');
const router = express.Router();
const passport = require('../config/passport');
const moment = require('moment');
const notifications = require('../utils/notifications');
const logger = require('../utils/logging');

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
        const errorMessage = "Invalid Parameters"
        logger.error('Route Params Mismatch', {tags:['validation'], url:req.originalUrl, userId:jwtPayload.id, body: req.body, error:errorMessage});
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
            SELECT ms.company_contact_ids, ms.recruiter_id, \
                c.company_name as "companyName", \
                umsub.user_id as "candidateId", \
                ms.post_id as "postId", \
                jpa.title as "postTitle", \
                concat(umsub.first_name, \' \', umsub.last_name) as "candidateName", \
                concat(r.first_name, \' \', r.last_name) as "recruiterName" \
            FROM ( \
                SELECT gm.message_subject_id, gm.user_id_1, gm.user_id_2, gm.subject_user_id, gm.created_on, gm.post_id, gm.company_id, gm.recruiter_id, array_agg(gm.company_contact_id) as company_contact_ids  \
                FROM \
                (\
                    SELECT \
                        m.message_subject_id, m.user_id_1, m.user_id_2, m.created_on, m.post_id, m.subject_user_id,\
                        coalesce(ec1.company_contact_id, ec2.company_contact_id) as company_contact_id, \
                        coalesce(ec1.company_id, ec2.company_id) as company_id, \
                        CASE WHEN ec2.company_id IS NULL THEN m.user_id_2 ELSE m.user_id_1 END as recruiter_id \
                    FROM messages_subject m \
                    LEFT JOIN company_contact ec1 ON m.user_id_1 = ec1.company_id \
                    LEFT JOIN company_contact ec2 ON m.user_id_2 = ec2.company_id \
                    WHERE m.message_subject_id = ${messageSubjectId} \
                ) gm \
                GROUP BY gm.message_subject_id, gm.user_id_1, gm.user_id_2, gm.subject_user_id, gm.created_on, gm.post_id, gm.company_id, gm.recruiter_id \
            ) ms \
            INNER JOIN job_posting_all jpa ON jpa.post_id = ms.post_id \
            INNER JOIN user_master umsub ON umsub.user_id = ms.subject_user_id \
            INNER JOIN company c ON c.company_id = ms.company_id \
            INNER JOIN recruiter r ON r.recruiter_id = ms.recruiter_id \
            WHERE (${userId} = ANY(ms.company_contact_ids) OR ms.recruiter_id = ${userId}) AND jpa.active \
            ', {userId:userId, messageSubjectId:body.messageSubjectId})
        .then((data) => {
            data['fromName'] = jwtPayload.userType === 1?data.recruiterName:data.companyName
            data['message'] = body.message
            data['meetingSubject'] = body.subject
            data['locationType'] = body.locationType
            data['dateOffer'] = moment(body.dateOffer).format("LLL")
            data['minuteLength'] = body.minuteLength >= 60?((body.minuteLength/60).toString()+" hour"+(body.minuteLength === 60?'':'s')):(body.minuteLength+" minutes")
            const userIds = jwtPayload.userType === 1?data.company_contact_ids:data.recruiter_id
            if(messageType === 1) // Chat Message
                notifications.addNotification(userIds, jwtPayload.userType === 1 ? 'employerNewChat' : 'recruiterNewChat', data)
            else // Meeting REquest
                notifications.addNotification(userIds, jwtPayload.userType === 1 ? 'employerNewMeeting' : 'recruiterNewMeeting', data)
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
            })
        })
    }).catch((err)=>{
        logger.error('Message SQL Call Failed', {tags:['sql'], url:req.originalUrl, userId:jwtPayload.id, error:err, body:req.body});
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
    if(response !== 1 && response !== 2){
        const errorMessage = "Invalid response"
        logger.error('Route Params Mismatch', {tags:['validation'], url:req.originalUrl, userId:jwtPayload.id, body: req.body, error:errorMessage});
        return res.status(400).json({success:false, error:errorMessage})
    }

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
        return postgresdb.none('UPDATE messages_calander SET response = $1 WHERE message_id_calander = $2', [response, messageId])
        .then((data) => {
            res.json({success:true})
        })
    })
    .catch(err => {
        logger.error('Message SQL Call Failed', {tags:['sql'], url:req.originalUrl, userId:jwtPayload.id, error:err, body:req.body});
        res.status(400).json({success:false, error:err})
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
            ms.user_id_1, ms.user_id_2, \
            ms.company_contact_ids, \
            c.company_name, \
            r.recruiter_id, r.first_name as recruiter_first_name, r.last_name as recruiter_last_name, \
            (count(1) OVER())/10+1 AS page_count, ${userId} as my_id \
        FROM ( \
            SELECT gm.message_subject_id, gm.user_id_1, gm.user_id_2, gm.subject_user_id, gm.created_on, gm.post_id, gm.company_id, gm.recruiter_id, array_agg(gm.company_contact_id) as company_contact_ids  \
            FROM \
            (\
                SELECT \
                    m.message_subject_id, m.user_id_1, m.user_id_2, m.created_on, m.post_id, m.subject_user_id,\
                    coalesce(ec1.company_contact_id, ec2.company_contact_id) as company_contact_id, \
                    coalesce(ec1.company_id, ec2.company_id) as company_id, \
                    CASE WHEN ec2.company_id IS NULL THEN m.user_id_2 ELSE m.user_id_1 END as recruiter_id \
                FROM messages_subject m \
                LEFT JOIN company_contact ec1 ON m.user_id_1 = ec1.company_id \
                LEFT JOIN company_contact ec2 ON m.user_id_2 = ec2.company_id \
            ) gm \
            GROUP BY gm.message_subject_id, gm.user_id_1, gm.user_id_2, gm.subject_user_id, gm.created_on, gm.post_id, gm.company_id, gm.recruiter_id \
        ) ms \
        LEFT JOIN ( \
            SELECT mo.* \
            FROM ( \
                SELECT ml.message_id, ml.message_subject_id, ml.message, ml.response, ml.date_offer, ml.has_seen, ml.created_on, ml.to_id, \
                ROW_NUMBER() OVER (PARTITION BY message_subject_id, user_id_1, user_id_2 \
                                    ORDER BY created_on DESC) AS rn \
                FROM messages ml \
            ) mo \
            WHERE mo.rn = 1 \
        ) m ON ms.message_subject_id = m.message_subject_id \
        INNER JOIN job_posting_all jpa ON jpa.post_id = ms.post_id \
        INNER JOIN user_master umsub ON umsub.user_id = ms.subject_user_id \
        INNER JOIN company c ON c.company_id = ms.company_id \
        INNER JOIN recruiter r ON r.recruiter_id = ms.recruiter_id \
        WHERE (${userId} = ANY(ms.company_contact_ids) OR ms.recruiter_id = ${userId}) AND jpa.active \
        ORDER BY coalesce(m.created_on, ms.created_on) DESC \
        OFFSET ${page} \
        LIMIT 10 \
        ', {userId:userId, page:(page-1)*10})
    .then((data) => {
        // Marshal data
        data = data.map(m=>{
            m.toMe = jwtPayload.userType === 1 ? m.to_id === m.recruiter_id : m.to_id !== m.recruiter_id;
            let contactName = jwtPayload.userType === 1?
                (m.company_name):
                (m.recruiter_first_name+" "+m.recruiter_last_name);
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
        logger.error('Message SQL Call Failed', {tags:['sql'], url:req.originalUrl, userId:jwtPayload.id, error:err, body:req.body});
        res.status(400).json({success:false, error:err})
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
        const errorMessage = "Missing Message Subject Id"
        logger.error('Route Params Mismatch', {tags:['validation'], url:req.originalUrl, userId:jwtPayload.id, body: req.body, error:errorMessage});
        return res.status(400).json({success:false, error:errorMessage})
    }
    var jwtPayload = req.body.jwtPayload;
    // Validate that the user id of the user is in the requested chain
    var userId = jwtPayload.id;
    if(page == null)
        page = 1;
    postgresdb.any('\
        SELECT m.message_id, ms.post_id, m.to_id, m.created_on, m.responded, m.message_type_id, \
            m.message, m.has_seen, m.date_offer, m.response, m.minute_length, m.location_type_name, m.meeting_subject, \
            ms.user_id_1, ms.user_id_2, \
            m.message_subject_id, \
            umsub.user_type_id as subject_user_type_id, umsub.user_type_name as subject_user_type_name, \
            umsub.user_id as subject_user_id, umsub.first_name as subject_first_name, umsub.last_name as subject_last_name, \
            ms.company_contact_ids, \
            c.company_name, \
            r.recruiter_id, r.first_name as recruiter_first_name, r.last_name as recruiter_last_name, \
            (count(1) OVER())/10+1 AS page_count, ${userId} as my_id \
        FROM messages m \
        INNER JOIN ( \
            SELECT gm.message_subject_id, gm.user_id_1, gm.user_id_2, gm.subject_user_id, gm.created_on, gm.post_id, gm.company_id, gm.recruiter_id, array_agg(gm.company_contact_id) as company_contact_ids  \
            FROM \
            (\
                SELECT \
                    m.message_subject_id, m.user_id_1, m.user_id_2, m.created_on, m.post_id, m.subject_user_id,\
                    coalesce(ec1.company_contact_id, ec2.company_contact_id) as company_contact_id, \
                    coalesce(ec1.company_id, ec2.company_id) as company_id, \
                    CASE WHEN ec2.company_id IS NULL THEN m.user_id_2 ELSE m.user_id_1 END as recruiter_id \
                FROM messages_subject m \
                LEFT JOIN company_contact ec1 ON m.user_id_1 = ec1.company_id \
                LEFT JOIN company_contact ec2 ON m.user_id_2 = ec2.company_id \
            ) gm \
            GROUP BY gm.message_subject_id, gm.user_id_1, gm.user_id_2, gm.subject_user_id, gm.created_on, gm.post_id, gm.company_id, gm.recruiter_id \
        ) ms ON m.message_subject_id = ms.message_subject_id \
        INNER JOIN user_master umsub ON umsub.user_id = ms.subject_user_id \
        INNER JOIN job_posting_all jpa ON jpa.post_id = ms.post_id \
        INNER JOIN company c ON c.company_id = ms.company_id \
        INNER JOIN recruiter r ON r.recruiter_id = ms.recruiter_id \
        WHERE (${userId} = ANY(ms.company_contact_ids) OR ms.recruiter_id = ${userId}) AND jpa.active AND ms.message_subject_id = ${messageSubjectId} \
        ORDER BY m.created_on DESC \
        OFFSET ${page} \
        LIMIT 10 \
        ', {userId:userId, messageSubjectId:messageSubjectId, page:(page-1)*10})
    .then((data) => {
        // Marshal data
        data = data.map(m=>{
            m.toMe = jwtPayload.userType === 1 ? m.to_id === m.recruiter_id : m.to_id !== m.recruiter_id;
            let contactName = jwtPayload.userType === 1?
                (m.company_name):
                (m.recruiter_first_name+" "+m.recruiter_last_name);
            m.contactName = contactName;
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
        logger.error('Message SQL Call Failed', {tags:['sql'], url:req.originalUrl, userId:jwtPayload.id, error:err, body:req.body});
        res.status(400).json({success:false, error:err})
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
        logger.error('Message SQL Call Failed', {tags:['sql'], url:req.originalUrl, userId:jwtPayload.id, error:err, body:req.body});
        res.status(400).json({success:false, error:err})
    });
});

module.exports = router;