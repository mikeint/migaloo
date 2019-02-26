const express = require('express');
const router = express.Router();
const passport = require('../../config/passport');
const moment = require('moment');

const validateMessageInput = require('../../validation/message');  
const db = require('../../config/db')
const postgresdb = db.postgresdb
const pgp = db.pgp
const messagesInsertHelper = new pgp.helpers.ColumnSet(['from_id', 'to_id', 'candidate_id', 'post_id', 'chain_id', 'subject', 'message'], {table: 'messages'});

/**
 * Create a new candidate for the recruiter
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
     * post_id
     * candidate_id
     * chain_id (Optional)
     */
    var body = req.body
    const { errors, isValid } = validateMessageInput(body);
    //check Validation
    if(!isValid) {
        return res.status(400).json(errors);
    }
    var jwtPayload = body.jwtPayload;
    postgresdb.tx(t => {
        // Get basic data, and ensure they can message
        return t.any('\
            SELECT ec.employer_contact_id, cp.recruiter_id, cp.candidate_id, cp.post_id \
            FROM candidate_posting cp \
            INNER JOIN job_posting_contact jpc ON cp.post_id = jpc.post_id \
            INNER JOIN job_posting jp ON cp.post_id = jp.post_id \
            INNER JOIN employer_contact ec ON cp.employer_id = ec.employer_id \
            WHERE cp.accepted AND jp.post_id = $1 AND cp.candidate_id = $2', [body.post_id, body.candidate_id])
        .then((data) => {
            // Ensure the person is in this chain
            if(data.length == 0 || data.findIndex(d=>d.employer_contact_id == jwtPayload.id || d.recruiter_id == jwtPayload.id) == -1){
                return res.status(400).json({success: false, error:"You are not involved in this conversation"})
            }else{
                const makeMessage = (d, chain_id)=>{
                    if(body.post_id == d.employer_contact_id){
                        d.from_id = d.employer_contact_id;
                        d.to_id = d.recruiter_id;
                    }else{
                        d.from_id = d.recruiter_id;
                        d.to_id = d.employer_contact_id;
                    }
                    d.chain_id = chain_id;
                    d.subject = body.subject;
                    d.message = body.message;
                    return d
                }
                // If this is the first message in the chain
                if(body.chain_id != null){
                    // Write the first message, and return the chain_id
                    var data0 = data[0];
                    return t.one('\
                    INSERT INTO messages (from_id, to_id, candidate_id, post_id, subject, message) \
                    VALUES ($/from_id/, $/to_id/, $/candidate_id/, $/post_id/, $/subject/, $/message/) RETURNING chain_id', makeMessage(data0, null)).then((message_data) => {
                        // Check if there is more then one message
                        if(data.length > 1){
                            const query = pgp.helpers.insert(data.slice(1).map(makeMessage, message_data.chain_id), messagesInsertHelper);
                            return t.none(query).then(() => {
                                return res.json({success: true})
                            }).catch((err)=>{
                                console.log(err)
                                return res.status(500).json({success: false, error:err})
                            });
                        }else{
                            // If there is only one message end
                            return res.json({success: true})
                        }
                    }).catch((err)=>{
                        console.log(err)
                        return res.status(500).json({success: false, error:err})
                    });
                }else{
                    // If this is not the first message in the chain, just write
                    const query = pgp.helpers.insert(data.map(makeMessage, body.chain_id), messagesInsertHelper);
    
                    return t.none(query).then(() => {
                        res.json({success: true})
                    }).catch((err)=>{
                        console.log(err)
                        return res.status(500).json({success: false, error:err})
                    });
                }
            }
        }).catch((err)=>{
            console.log(err)
            return res.status(500).json({success: false, error:err})
        });
    })
    .then(() => {
        console.log("Done TX")
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

    postgresdb.any('\
        SELECT m.chain_id, m.post_id, m.created_on, m.message_id, \
            m.candidate_id, m.subject, m.message, m.to_has_seen, m.from_has_seen, \
            CASE WHEN employer_contact_id IS NOT NULL AND employer_contact_id = m.to_id THEN employer_contact_id ELSE m.to_id END as to_id, \
            CASE WHEN employer_contact_id IS NOT NULL AND employer_contact_id = m.from_id THEN employer_contact_id ELSE m.from_id END as from_id, \
            (count(1) OVER())/10+1 AS page_count, message_count \
        FROM ( \
            SELECT jpc.employer_contact_id, m.chain_id, max(m.message_id) as message_id, count(1) as message_count \
            FROM messages m \
            INNER JOIN job_posting_contact jpc ON m.post_id = jpc.post_id \
            WHERE m.to_id = $1 OR m.from_id = $1 \
            GROUP BY jpc.employer_contact_id, m.chain_id \
            ORDER BY max(m.created_on) DESC \
            OFFSET $2 \
            LIMIT 10 \
        ) ml \
        INNER JOIN messages m ON m.message_id = ml.message_id \
        ', [jwtPayload.id, (page-1)*10])
    .then((data) => {
        // Marshal data
        data = data.map(m=>{
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
router.get('/listChain/:chainId', passport.authentication, listMessagesChain);
router.get('/listChain/:chainId/:page', passport.authentication, listMessagesChain);
function listMessagesChain(req, res){
    var page = req.params.page;
    var chainId = parseInt(req.params.chain_id, 10);
    if(chainId == null){
        return res.status(400).json({success:false, error:"Missing chain Id"})
    }
    if(page == null)
        page = 1;
    var jwtPayload = req.body.jwtPayload;

    postgresdb.any('\
        SELECT m.chain_id, m.post_id, m.created_on, m.message_id, m.to_id, m.from_id, \
            m.candidate_id, m.subject, m.message, m.to_has_seen, m.from_has_seen, \
            (count(1) OVER())/10+1 AS page_count \
        FROM messages m \
        WHERE (m.to_id = $1 OR m.from_id = $1) AND m.chain_id = $2 \
        ORDER BY m.created_on DESC \
        OFFSET $1 \
        LIMIT 10 \
        ', [jwtPayload.id, chainId, (page-1)*10])
    .then((data) => {
        // Marshal data
        data = data.map(m=>{
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