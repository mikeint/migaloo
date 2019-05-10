const express = require('express');
const router = express.Router();
const ses = require('../utils/ses');
const logger = require('../utils/logging');

/**
 * Send an email with a message to info@migaloo.io
 * @route GET api/landing/sendContactEmail
 * @group landing - Landing
 * @param {Object} body.optional
 * @returns {object} 200 - A map of profile information
 * @returns {Error}  default - Unexpected error
 * @access Private
 */
router.post('/sendContactEmail', (req, res) => {
    const name = req.body.name;
    const email = req.body.email;
    const message = req.body.message;
    if(name == null || name.length === 0){
        const errorMessage = "Missing name field"
        logger.error('Route Params Mismatch', {tags:['validation'], url:res.originalUrl, userId:jwtPayload.id, body: req.body, error:errorMessage});
        return res.status(400).json({success:false, error:errorMessage})
    }
    if(email == null || email.length === 0){
        const errorMessage = "Missing email field"
        logger.error('Route Params Mismatch', {tags:['validation'], url:res.originalUrl, userId:jwtPayload.id, body: req.body, error:errorMessage});
        return res.status(400).json({success:false, error:errorMessage})
    }
    if(message == null || message.length === 0){
        const errorMessage = "Missing message field"
        logger.error('Route Params Mismatch', {tags:['validation'], url:res.originalUrl, userId:jwtPayload.id, body: req.body, error:errorMessage});
        return res.status(400).json({success:false, error:errorMessage})
    }
    
    ses.sendContactMessage({name:name.trim(), email:email.trim(), message:message.trim()})
    .then(result=>{
        res.json({success:true})
    })
});

module.exports = router;