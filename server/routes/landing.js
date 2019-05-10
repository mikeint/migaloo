const express = require('express');
const router = express.Router();
const ses = require('../utils/ses');
const logger = require('../utils/logging');
const useragent = require('useragent');


/**
 * See if there is a new user accessing the website
 * Note: If local storage or cookies are cleared then we would log them again
 * Note2: If the page is refreshed we would log them again
 * @route POST api/landing/helloThere
 * @group landing - Landing
 * @param {Object} body.optional
 * @returns {object} 200 - A map of profile information
 * @returns {Error}  default - Unexpected error
 * @access Private
 */
router.post('/helloThere', (req, res) => {
    const ip = req.connection.remoteAddress
    const uuid = req.body.uuid
    const newUser = req.body.newUser
    const agent = useragent.parse(req.headers['user-agent'], req.query.jsuseragent)
    const tags = ['landing']
    if(newUser){
        tags.push('new')
    }
    logger.info('User Accessed Website', {tags:tags, url:req.originalUrl, agent:agent, uuid, ip:ip})
    res.json({success:true})
});

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
        logger.error('Route Params Mismatch', {tags:['validation'], url:req.originalUrl,body: req.body, error:errorMessage});
        return res.status(400).json({success:false, error:errorMessage})
    }
    if(email == null || email.length === 0){
        const errorMessage = "Missing email field"
        logger.error('Route Params Mismatch', {tags:['validation'], url:req.originalUrl, body: req.body, error:errorMessage});
        return res.status(400).json({success:false, error:errorMessage})
    }
    if(message == null || message.length === 0){
        const errorMessage = "Missing message field"
        logger.error('Route Params Mismatch', {tags:['validation'], url:req.originalUrl, body: req.body, error:errorMessage});
        return res.status(400).json({success:false, error:errorMessage})
    }
    
    ses.sendContactMessage({name:name.trim(), email:email.trim(), message:message.trim()})
    .then(result=>{
        logger.info('Sent Contact Email', {tags:['email', 'contact'], url:req.originalUrl, body:req.body});
        res.json({success:true})
    }).catch((err)=>{
        logger.error('Send Contact Email Failed', {tags:['email', 'contact'], url:req.originalUrl, error:err, body:req.body});
        res.status(500).json({success:false})
    })
});

module.exports = router;