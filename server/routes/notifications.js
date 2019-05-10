const db = require('../config/db');
const notifications = require('../utils/notifications');
const express = require('express');
const passport = require('../config/passport');
const moment = require('moment');
const router = express.Router();
const postgresdb = db.postgresdb
const pgp = db.pgp
const logger = require('../utils/logging');


/**
 * Get the last notification id for future reference
 * @route GET api/lastId
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
    if(page == null)
        page = 1;
    notifications.getNewNotifications(jwtPayload.id, lastId)
    .then((data) => {
        // Marshal data
        data = data.map(m=>{
            var timestamp = moment(m.created_on);
            var ms = timestamp.diff(moment());
            m.created = moment.duration(ms).humanize() + " ago";
            m.created_on = timestamp.format("x");
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
        data = data.map(m=>{
            var timestamp = moment(m.created_on);
            var ms = timestamp.diff(moment());
            m.created = moment.duration(ms).humanize() + " ago";
            m.created_on = timestamp.format("x");
            return m
        })
        res.json({success:true, notificationList:data, counts:counts})
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
    notifications.addNotification(jwtPayload.id, 'newJobPosting', {companyName: "Beggings", postId:1, postTitle:"I want food"})
    .then((data) => {
        res.json({success:true})
    })
    .catch(err => {
        logger.error('Notification SQL Call Failed', {tags:['sql'], url:req.originalUrl, userId:jwtPayload.id, error:err.message || err, body:req.body});
        res.status(500).json({success:false, error:err})
    });
}

module.exports = router