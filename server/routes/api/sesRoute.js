var aws = require('aws-sdk');
var ses = new aws.SES();

function sendEmployerContactVerification(parms){
    const params = {
        "Source":"account@hireranked.com",
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
              "verifyLink":"https://hireranked.com/link?token=dsfdsgsfdg",
              "resendLink":"https://hireranked.com/link?token=dsfdsgsfdg",
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
        "Source":"account@hireranked.com",
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
              "verifyLink":"https://hireranked.com/link?token=dsfdsgsfdg",
              "resendLink":"https://hireranked.com/link?token=dsfdsgsfdg",
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

module.exports = {
    sendEmployerContactVerification:sendEmployerContactVerification,
    sendRecruiterVerification:sendRecruiterVerification
};