const aws = require('aws-sdk');
const settings = require('../config/settings');
const NODE_ENV = process.env.NODE_ENV || 'dev';
aws.config.update(
  {
      accessKeyId:settings.aws.accessKey,
      secretAccessKey:settings.aws.secretKey,
      region:"us-east-1"
  }
);
var ses
if(NODE_ENV === 'mocha'){
    ses = {
        sendTemplatedEmail: (p, func) =>{
            func(null, {success:true})
        }
    }
}else
    ses = new aws.SES();
const passport = require('../utils/passport');

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
                        NODE_ENV==='production'?args.email:'development@migaloo.io'
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
                        NODE_ENV==='production'?args.email:'development@migaloo.io'
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

function sendJobPostLink(args){
    return new Promise((resolve, reject)=>{
        const params = {
            "Source":"accounts@migaloo.io",
            "Template":"PostJobEmail",
            "Destination":{
                "ToAddresses":[
                    NODE_ENV==='production'?args.email:'development@migaloo.io'
                ]
            },
            "TemplateData":JSON.stringify({ 
                "name":args.name,
                "link":`https://migaloo.io/postJob/${args.token}`,
                "year":new Date().getFullYear()
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

module.exports = {
    sendContactMessage:sendContactMessage,
    sendEmailVerification:sendEmailVerification,
    sendSignupEmail:sendSignupEmail,
    sendUserInvite:sendUserInvite,
    resetPasswordEmail:resetPasswordEmail,
    sendJobPostLink:sendJobPostLink
};