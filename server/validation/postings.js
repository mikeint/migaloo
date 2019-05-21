const Validator = require('validator');
const isEmpty = require('./isEmpty');

module.exports = function validatePostingsInput(data) {
    let errors = {};

    // Need: given_name, family_name, phone_number
    if (Validator.isEmpty(data.title)) {
        errors.title = 'Title field is required';
    }
    if (Validator.isEmpty(data.requirements)) {
        errors.requirements = 'Requirements field is required';
    }
    return {
        errors,
        isValid: isEmpty(errors)
    };
};