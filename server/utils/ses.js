const aws = require('aws-sdk');
const key = require('../config/keys');
aws.config.update(
  {
      accessKeyId:key.awsAccessKey,
      secretAccessKey:key.awsSecretKey,
      region:"us-east-1"
  }
);
const ses = new aws.SES();
const passport = require('../config/passport');

function sendEmailVerification(args){
    return new Promise((resolve, reject)=>{
        const jwtPayload = {
            user_id: args.user_id,
            name: args.name,
            email: args.email,
            type: args.type,
            rand: Math.random()
        }
        passport.signToken(jwtPayload, "1h").then(token=>{
            const params = {
                "Source":"signup@migaloo.io",
                "Template":"VerifyEmail",
                "Destination":{
                    "ToAddresses":[
                        args.email
                    ]
                },
                "TemplateData":JSON.stringify({ 
                    "name":args.name,
                    "link":`https://migaloo.io/auth/verifyEmail/${token}`,
                    "year":new Date().getFullYear()
                })
            }
            ses.sendTemplatedEmail(params, function(err, data) {
                if (err){
                    reject(err)
                }
                else 
                    resolve(data);           // successful response
            });
        }).catch(reject)
    })
}
function sendContactMessage(args){
    return new Promise((resolve, reject)=>{
        const params = {
            "Source":"noreply@migaloo.io",
            "Template":"ContactEmail",
            "Destination":{
                "ToAddresses":[
                    "info@migaloo.io"
                ]
            },
            "TemplateData":JSON.stringify({ 
                "name":args.name,
                "email": args.email,
                "message": args.message,
                "year":new Date().getFullYear()
            })
        }
        ses.sendTemplatedEmail(params, function(err, data) {
            if (err){
                reject(err)
            }
            else 
                resolve(data);           // successful response
        });
    })
}
// Not Used
function sendUserInvite(user_id, email, company){
    return new Promise((resolve, reject)=>{
        const params = {
            "Source":"signup@migaloo.io",
            "Template":"VerifyOrganizationEmail",
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
        ses.sendTemplatedEmail(params, function(err, data) {
            if (err) reject(err);
            else     resolve(data);
        });
    })
}
function sendSignupEmail(args){
  return new Promise((resolve, reject)=>{
    const params = {
        "Source":"info@migaloo.io",
        "Template":"SignupInfoEmail",
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
    ses.sendTemplatedEmail(params, function(err, data) {
        if (err)
            reject(err)
        else 
            resolve(data);
    });
  })
}
function resetPasswordEmail(args){
    return new Promise((resolve, reject)=>{
        const jwtPayload = {
            name: args.name,
            email: args.email,
            rand: Math.random()
        }
        passport.signToken(jwtPayload, "1h").then(token=>{
            const nameParam = new Buffer(args.name).toString('base64')
            const params = {
                "Source":"info@migaloo.io",
                "Template":"ResetPasswordEmail",
                "Destination":{
                    "ToAddresses":[
                        args.email
                    ]
                },
                "TemplateData":JSON.stringify({ 
                    "name":args.name,
                    "link":`https://migaloo.io/auth/resetpassword/${token}/${nameParam}`,
                    "year":new Date().getFullYear()
                })
            }
            ses.sendTemplatedEmail(params, function(err, data) {
                if (err)
                    reject(err)
                else 
                    resolve(data);
            });
        }).catch(reject)
    })
}

module.exports = {
    sendContactMessage:sendContactMessage,
    sendEmailVerification:sendEmailVerification,
    sendSignupEmail:sendSignupEmail,
    sendUserInvite:sendUserInvite,
    resetPasswordEmail:resetPasswordEmail
};