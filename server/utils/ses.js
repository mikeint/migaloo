const aws = require('aws-sdk');
const ses = new aws.SES();
const passport = require('../config/passport');

function sendEmployerContactVerification(args){
    const params = {
        "Source":"signup@migaloo.io",
        "Template":"VerifyOrganizationEmail",
        "Destinations":[
          {
            "Destination":{
              "ToAddresses":[
                "success@simulator.amazonses.com"
              ]
            },
            "TemplateData":JSON.stringify({ 
              "name":"Anaya Harford",
              "companyName":"Google",
              "verifyLink":"https://migaloo.io/link?token=dsfdsgsfdg",
              "resendLink":"https://migaloo.io/link?token=dsfdsgsfdg",
              "year":new Date().getFullYear()
            })
          }
        ]
    }
    ses.sendTemplatedEmail(params, function(err, data) {
        if (err) console.log(err, err.stack); // an error occurred
        else     console.log(data);           // successful response
    });
}
function sendUserInvite(user_id, email, company){
    const params = {
        "Source":"signup@migaloo.io",
        "Template":"VerifyOrganizationEmail",
        "Destinations":[
          {
            "Destination":{
              "ToAddresses":[
                "success@simulator.amazonses.com"
                // email
              ]
            },
            "TemplateData":JSON.stringify({ 
              "companyName":company,
              "verifyLink":"https://migaloo.io/link?token=dsfdsgsfdg",
              "resendLink":"https://migaloo.io/link?token=dsfdsgsfdg",
              "year":new Date().getFullYear()
            })
          }
        ]
    }
    ses.sendTemplatedEmail(params, function(err, data) {
        if (err) console.log(err, err.stack); // an error occurred
        else     console.log(data);           // successful response
    });
}
function sendRecruiterVerification(args){
    const params = {
        "Source":"signup@migaloo.io",
        "Template":"VerifyOrganizationEmail",
        "Destinations":[
          {
            "Destination":{
              "ToAddresses":[
                "success@simulator.amazonses.com"
              ]
            },
            "TemplateData":JSON.stringify({ 
              "name":"Anaya Harford",
              "companyName":"Google",
              "verifyLink":"https://migaloo.io/link?token=dsfdsgsfdg",
              "resendLink":"https://migaloo.io/link?token=dsfdsgsfdg",
              "year":new Date().getFullYear()
            })
          }
        ]
    }
    ses.sendTemplatedEmail(params, function(err, data) {
        if (err) console.log(err, err.stack); // an error occurred
        else     console.log(data);           // successful response
    });
}
function sendSignupEmail(args){
    const params = {
        "Source":"info@migaloo.io",
        "Template":"SignupInfoEmail",
        "Destinations":[
          {
            "Destination":{
              "ToAddresses":[
                args.email
              ],
              "BccAddresses":[
                "info@migaloo.io"
              ],
            },
            "TemplateData":JSON.stringify({ 
              "name":args.name,
              "companyName":args.companyName
            })
          }
        ]
    }
    ses.sendTemplatedEmail(params, function(err, data) {
        if (err) console.log(err, err.stack); // an error occurred
        else     console.log(data);           // successful response
    });
}
function resetPasswordEmail(params){
  const jwtPayload = {
    user_id: args.user_id,
    name: args.name,
    email: args.email,
    rand: Math.random()
  }
  passport.signToken(jwtPayload, "1h").then(token=>{
    const nameParam = new Buffer(args.name).toString('base64')
    const params = {
        "Source":"info@migaloo.io",
        "Template":"ResetPassword",
        "Destinations":[
          {
            "Destination":{
              "ToAddresses":[
                args.email
              ]
            },
            "TemplateData":JSON.stringify({ 
              "name":args.name,
              "link":`https://migaloo.io/auth/resetpassword/${token}/${nameParam}`
            })
          }
        ]
    }
    ses.sendTemplatedEmail(params, function(err, data) {
        if (err) console.log(err, err.stack); // an error occurred
        else     console.log(data);           // successful response
    });
  })
}

module.exports = {
    sendEmployerContactVerification:sendEmployerContactVerification,
    sendRecruiterVerification:sendRecruiterVerification,
    sendSignupEmail:sendSignupEmail,
    sendUserInvite:sendUserInvite
};