const Validator = require('validator');
const isEmpty = require('./isEmpty');

module.exports = function validateEmployerInput(data) {
    let errors = {};
    if (data.first_name != null && Validator.isEmpty(data.first_name)) {
        errors.first_name = 'First Name field is required';
    }
    if (data.last_name != null && Validator.isEmpty(data.last_name)) {
        errors.last_name = 'Last Name field is required';
    }
    if (data.phone_number != null && Validator.isEmpty(data.phone_number)) {
        errors.phone_number = 'Phone Number field is required';
    }
    return {
        errors,
        isValid: isEmpty(errors)
    };
};