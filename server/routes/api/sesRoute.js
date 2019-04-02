const aws = require('aws-sdk');
const ses = new aws.SES();

function sendEmployerContactVerification(parms){
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
function sendRecruiterVerification(parms){
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
function sendSignupEmail(parms){
    const params = {
        "Source":"info@migaloo.io",
        "Template":"SignupInfoEmail",
        "Destinations":[
          {
            "Destination":{
              "ToAddresses":[
                parms.email
              ],
              "BccAddresses":[
                "info@migaloo.io"
              ],
            },
            "TemplateData":JSON.stringify({ 
              "name":params.name,
              "companyName":params.companyName
            })
          }
        ]
    }
    ses.sendTemplatedEmail(params, function(err, data) {
        if (err) console.log(err, err.stack); // an error occurred
        else     console.log(data);           // successful response
    });
}

module.exports = {
    sendEmployerContactVerification:sendEmployerContactVerification,
    sendRecruiterVerification:sendRecruiterVerification,
    sendSignupEmail:sendSignupEmail
};