 /* ******************************************** MAIL TO */
const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer'); 
const sesRoute = require('./api/sesRoute');   

router.post("/", (req, res) => {
    //console.log(req.body);
    nodemailer.createTestAccount((err, account) => {
        const htmlEmail = `
            <h3>CONTACT INFO</h3>
            <ul>
                <li>First name: ${req.body.firstname}</li> 
                <li>Email: ${req.body.email}</li>   
            </ul>
            <br>
            <p>${req.body.message}</p>
        `

        let transporter = nodemailer.createTransport({ 
            service: 'gmail',
            auth: {
                user: 'loginTestmailer@gmail.com',
                pass: 'Login123!'
            }
        });

        let mailOptions = {
            from: '"loginTestmailer@gmail.com', // sender address
            to: 'michael.sansone@hotmail.com', // list of receivers
            replyTo: 'michael.sansone@hotmail.com',
            subject: 'Hello ✔', // Subject line
            text: req.body.message, // plain text body
            html: htmlEmail // html body
        };

        transporter.sendMail(mailOptions, (err, info) => {
            if (err) {
                return console.log(err);
            }
            console.log('Message sent: %s', info.messageId); 
            //console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
            return res.json(info.messageId);
        });

    })
})
router.post("/signup", (req, res) => {
    var params = {
        email: req.body.email,
        name: req.body.name,
        companyName: req.body.companyName
    }
    sesRoute.sendSignupEmail(params)
    res.json({success:true})
})
module.exports = router;

/* ******************************************** MAIL TO */