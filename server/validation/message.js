const Validator = require('validator');
const isEmpty = require('./isEmpty');

module.exports = function validateMessageInput(data) {
    let errors = {};

    // Need: given_name, family_name, phone_number
    if (Validator.isEmpty(data.subject)) {
        errors.subject = 'Subject field is required';
    }
    if (Validator.isEmpty(data.message)) {
        errors.message = 'Message field is required';
    }
    return {
        errors,
        isValid: isEmpty(errors)
    };
};