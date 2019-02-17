const Validator = require('validator');
const isEmpty = require('./isEmpty');

module.exports = function validateProfileInput(data) {
    let errors = {};

    if (data.type == null) {
        errors.type = "Type is required"
    }
    else if (!data.type instanceof Number) {
        errors.type = "Type is should be number"
    }
    else if (data.type < 1 || data.type > 2) {
        errors.type = "Type must be between 1 and 2"
    }
    if(data.type == 1){ // Recruiter
        // Need: given_name, family_name, phone_number
        if (Validator.isEmpty(data.givenName)) {
            errors.givenName = 'Given Name field is required';
        }
        if (Validator.isEmpty(data.familyName)) {
            errors.familyName = 'Family Name field is required';
        }
        if (Validator.isEmpty(data.phoneNumber)) {
            errors.phoneNumber = 'Phone Number field is required';
        }
    }else if(data.type == 2){ // Employer
        // Need: contact_given_name, contact_family_name, contact_phone_number, company_name
        if (Validator.isEmpty(data.givenName)) {
            errors.givenName = 'Given Name field is required';
        }
        if (Validator.isEmpty(data.familyName)) {
            errors.familyName = 'Family Name field is required';
        }
        if (Validator.isEmpty(data.phoneNumber)) {
            errors.phoneNumber = 'Phone Number field is required';
        }
        if (Validator.isEmpty(data.companyName)) {
            errors.companyName = 'Comapany Name field is required';
        }
    }
    return {
        errors,
        isValid: isEmpty(errors)
    };
};