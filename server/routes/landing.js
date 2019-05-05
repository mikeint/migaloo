const express = require('express');
const router = express.Router();
const ses = require('../utils/ses');

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
    if(name == null || name.length === 0)
        return res.status(400).json({success:false, error:"Missing name field"})
    if(email == null || email.length === 0)
        return res.status(400).json({success:false, error:"Missing email field"})
    if(message == null || message.length === 0)
        return res.status(400).json({success:false, error:"Missing message field"})
    
    ses.sendContactMessage({name:name.trim(), email:email.trim(), message:message.trim()})
    .then(result=>{
        res.json({success:true})
    })
});

module.exports = router;