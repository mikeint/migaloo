const Validator = require('validator');
const isEmpty = require('./isEmpty');

module.exports = function validateProfileInput(data) {
    let errors = {};

    if (Validator.isEmpty(data.type)) {
        errors.skills = "Type is required"
    }
  
    return {
        errors,
        isValid: isEmpty(errors)
    };
};