const db = require('../utils/db');
const notifications = require('../utils/notifications');
const express = require('express');
const passport = require('../utils/passport');
const moment = require('moment');
const router = express.Router();
const postgresdb = db.postgresdb
const pgp = db.pgp
const logger = require('../utils/logging');

/**
 * Get the notification settings
 * @route GET api/notifications/settings
 * @group notifications - Notifications
 * @param {Object} body.optional
 * @returns {object} 200 - A list of notifications
 * @returns {Error}  default - Unexpected error
 * @access Private
 */
router.get('/settings', passport.authentication, (req, res) => {
    const jwtPayload = req.body.jwtPayload;
    return postgresdb.any('SELECT ns.*, nt.topic_name \
    FROM notification_settings ns \
    INNER JOIN notification_topic nt ON nt.topic_id = ns.topic_id \
    WHERE ns.user_id = ${userId} AND nt.user_type_id = ${userTypeId}', {
        userId: jwtPayload.id,
        userTypeId: jwtPayload.userType
    })
    .then((data) => {
        res.json({success:true, notificationSettings:data.map(d=>db.camelizeFields(d))})
    })
    .catch(err => {
        logger.error('Notification SQL Call Failed', {tags:['sql'], url:req.originalUrl, userId:jwtPayload.id, error:err.message || err, body:req.body});
        res.status(500).json({success:false, error:err})
    });
})
/**
 * Set the notification settings
 * @route POST api/notifications/settings
 * @group notifications - Notifications
 * @param {Object} body.optional
 * @returns {object} 200 - A list of notifications
 * @returns {Error}  default - Unexpected error
 * @access Private
 */
router.post('/settings', passport.authentication, (req, res) => {
    const jwtPayload = req.body.jwtPayload;
    const notificationSettings = req.body.notificationSettings
    if(notificationSettings == null){
        const errorMessage = "Missing notificationSettings field"
        logger.error('Route Params Mismatch', {tags:['validation'], url:req.originalUrl, userId:jwtPayload.id, body: req.body, params: req.params, error:errorMessage});
        return res.status(400).json({success:false, error:errorMessage})
    }
    postgresdb.tx(t => {
        t.batch(notificationSettings.map(d=>{
            return t.none('UPDATE notification_settings \
            SET email=${email}, notification=${notification} \
            WHERE user_id = ${userId} AND topic_id = ${topicId}', {
                userId: jwtPayload.id,
                topicId: d.topicId,
                notification: d.notification,
                email: d.email
            })
        }))
    })
    .then((data) => {
        res.json({success:true})
    })
    .catch(err => {
        logger.error('Notification SQL Call Failed', {tags:['sql'], url:req.originalUrl, userId:jwtPayload.id, error:err.message || err, body:req.body});
        res.status(500).json({success:false, error:err})
    });
})

/**
 * Get the last notification id for future reference
 * @route GET api/notifications/lastId
 * @group notifications - Notifications
 * @param {Object} body.optional
 * @returns {object} 200 - A list of notifications
 * @returns {Error}  default - Unexpected error
 * @access Private
 */
router.get('/lastId', passport.authentication, (req, res) => {
    return postgresdb.one('SELECT MAX(notification_id) as last_id FROM notification', {})
    .then((data) => {
        res.json({success:true, lastNotificationId:data.last_id})
    })
    .catch(err => {
        logger.error('Notification SQL Call Failed', {tags:['sql'], url:req.originalUrl, userId:jwtPayload.id, error:err.message || err, body:req.body});
        res.status(500).json({success:false, error:err})
    });
}) 
/**
 * Get new notifications
 * @route GET api/notifications/listNew
 * @group notifications - Notifications
 * @param {Object} body.optional
 * @returns {object} 200 - A list of notifications
 * @returns {Error}  default - Unexpected error
 * @access Private
 */
router.get('/listNew', passport.authentication, listNew) 
router.get('/listNew/:lastId', passport.authentication, listNew) 
router.get('/listNew/:lastId/:size', passport.authentication, listNew) 
router.get('/listNew/:lastId/:size/:page', passport.authentication, listNew) 
function listNew(req, res) {
    const jwtPayload = req.body.jwtPayload;
    var limit = req.params.size;
    var lastId = req.params.lastId;
    var page = req.params.page;
    if(lastId == null)
        lastId = 0;
    if(limit == null)
        limit = 5;
    if(page == null || page < 1)
        page = 1;
    notifications.getNewNotifications(jwtPayload.id, lastId)
    .then((data) => {
        // Marshal data
        data = data.map(db.camelizeFields).map(m=>{
            var timestamp = moment(m.createdOn);
            var ms = timestamp.diff(moment());
            m.created = moment.duration(ms).humanize() + " ago";
            m.createdOn = timestamp.format("x");
            return m
        })
        res.json({success:true, notificationList:data})
    })
    .catch(err => {
        logger.error('Notification SQL Call Failed', {tags:['sql'], url:req.originalUrl, userId:jwtPayload.id, error:err.message || err, body:req.body});
        res.status(500).json({success:false, error:err})
    });
}
/**
 * Get all notifications
 * @route GET api/notifications/list
 * @group notifications - Notifications
 * @param {Object} body.optional
 * @returns {object} 200 - A list of notifications
 * @returns {Error}  default - Unexpected error
 * @access Private
 */
router.get('/list', passport.authentication, list) 
router.get('/list/:size', passport.authentication, list) 
router.get('/list/:size/:searchAfter', passport.authentication, list) 
function list(req, res) {
    const jwtPayload = req.body.jwtPayload;
    var limit = req.params.size;
    var searchAfter = req.params.searchAfter;
    if(limit == null)
        limit = 5;
    Promise.all(
        [
            notifications.getAllNotificationsCounts(jwtPayload.id),
            notifications.getAllNotifications(jwtPayload.id, searchAfter, limit)
        ]
    )
    .then((ret) => {
        var counts = ret[0]
        var data = ret[1]
        // Marshal data
        data = data.map(db.camelizeFields).map(m=>{
            var timestamp = moment(m.createdOn);
            var ms = timestamp.diff(moment());
            m.created = moment.duration(ms).humanize() + " ago";
            m.createdOn = timestamp.format("x");
            return m
        })
        res.json({success:true, notificationList:data, counts:db.camelizeFields(counts)})
    })
    .catch(err => {
        logger.error('Notification SQL Call Failed', {tags:['sql'], url:req.originalUrl, userId:jwtPayload.id, error:err.message || err, body:req.body});
        res.status(500).json({success:false, error:err})
    });
}
/**
 * Set that the notification has been seen
 * @route GET api/notifications/setSeen
 * @group notifications - Notifications
 * @param {Object} body.optional
 * @returns {object} 200 - A list of notifications
 * @returns {Error}  default - Unexpected error
 * @access Private
 */
router.post('/setSeen', passport.authentication, setSeen)
function setSeen(req, res) {
    const jwtPayload = req.body.jwtPayload;
    const notificationIds = req.body.notificationIds; // List
    if(notificationIds == null || notificationIds.length === 0){
        return res.json({success:true})
    }
    notifications.notificationsSetSeen(jwtPayload.id, notificationIds)
    .then((data) => {
        res.json({success:true})
    })
    .catch(err => {
        logger.error('Notification SQL Call Failed', {tags:['sql'], url:req.originalUrl, userId:jwtPayload.id, error:err.message || err, body:req.body});
        res.status(500).json({success:false, error:err})
    });
}
router.get('/test', passport.authentication, test)
function test(req, res) {
    const jwtPayload = req.body.jwtPayload;
    notifications.addNotification(jwtPayload.id, 'newJobPosting', {companyName: "Begging", postId:1, postTitle:"I want food"})
    .then((data) => {
        res.json({success:true})
    })
    .catch(err => {
        logger.error('Notification SQL Call Failed', {tags:['sql'], url:req.originalUrl, userId:jwtPayload.id, error:err.message || err, body:req.body});
        res.status(500).json({success:false, error:err})
    });
}

module.exports = router