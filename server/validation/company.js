const Validator = require('validator');
const isEmpty = require('./isEmpty');

module.exports = function validateEmployerInput(data) {
    let errors = {};
    if (data.contact_first_name != null && Validator.isEmpty(data.contact_first_name)) {
        errors.contact_first_name = 'First Name field is required';
    }
    if (data.contact_last_name != null && Validator.isEmpty(data.contact_last_name)) {
        errors.contact_last_name = 'Last Name field is required';
    }
    if (data.contact_phone_number != null && Validator.isEmpty(data.contact_phone_number)) {
        errors.contact_phone_number = 'Phone Number field is required';
    }
    if (data.company_name != null && Validator.isEmpty(data.company_name)) {
        errors.company_name = 'Company Name field is required';
    }
    return {
        errors,
        isValid: isEmpty(errors)
    };
};