const Validator = require('validator');
const isEmpty = require('./isEmpty');

module.exports = function validateMessageInput(data) {
    let errors = {};
    if (Validator.isEmpty(data.messageSubjectId)) {
        errors.messageSubjectId = 'Subject field is required';
    }
    if (!data.messageType || data.messageType < 1 || data.messageType > 2) {
        errors.messageType = 'Valid messageType is required';
    }
    if(data.messageType === 1){
        if (!data.message || Validator.isEmpty(data.message)){
            errors.message = 'Message field is required';
        }
    }else if(data.messageType === 2){
        if(!data.dateOffer || Validator.isEmpty(data.dateOffer)){
            errors.dateOffer = 'Date Offer field is required';
        }
        if(!data.minuteLength || data.minuteLength <= 0){
            errors.minuteLength = 'Minute Length field is required';
        }
        if(!data.subject || Validator.isEmpty(data.subject)){
            errors.subject = 'Subject field is required';
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