const Validator = require('validator');
const isEmpty = require('./isEmpty');

module.exports = function validateMessageInput(data) {
    let errors = {};
    if (Validator.isEmpty(data.messageSubjectId)) {
        errors.messageSubjectId = 'Subject field is required';
    }
    if ((!data.message || Validator.isEmpty(data.message)) && (!data.dateOffer || Validator.isEmpty(data.dateOffer))) {
        errors.message = 'Message field is required';
        errors.dateOffer = 'Date Offer field is required';
    }else if(!data.dateOffer && !Validator.isEmpty(data.dateOffer)){
        if(Validator.isEmpty(data.minuteLength)){
            errors.minuteLength = 'Minute Length field is required';
        }
        if(Validator.isEmpty(data.subject)){
            errors.minuteLength = 'Subject field is required';
        }
    }
    if (Validator.isEmpty(data.toId)) {
        errors.toId = 'To Id field is required';
    }
    return {
        errors,
        isValid: isEmpty(errors)
    };
};