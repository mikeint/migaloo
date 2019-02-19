const Validator = require('validator');
const isEmpty = require('./isEmpty');

module.exports = function validateCandidateInput(data) {
    let errors = {};

    // Need: given_name, family_name, phone_number
    if (Validator.isEmpty(data.firstName)) {
        errors.title = 'First field is required';
    }
    if (Validator.isEmpty(data.lastName)) {
        errors.title = 'Last field is required';
    }
    //validator function isEmail checks.
    if (!Validator.isEmail(data.email)) {
        errors.email = 'Email is invalid';
    }
    if (Validator.isEmpty(data.email)) {
        errors.email = 'Email field is required';
    }
    return {
        errors,
        isValid: isEmpty(errors)
    };
};