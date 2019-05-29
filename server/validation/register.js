const Validator = require('validator');
const isEmpty = require('./isEmpty');

module.exports = function validateRegisterInput(data) {
	let errors = {};

	data.firstName = !isEmpty(data.firstName) ? data.firstName : '';
	data.lastName = !isEmpty(data.lastName) ? data.lastName : '';
	data.email = !isEmpty(data.email) ? data.email : '';

    if (data.type == null) {
        errors.type = "Type is required"
    }
    else if (!data.type instanceof Number) {
        errors.type = "Type is should be number"
    }
    else if (data.type !== 1 && data.type !== 3) {
        errors.type = "Type must be 1 or 3"
    }
	if (Validator.isEmpty(data.firstName)) {
		errors.firstName = 'First Name field is required';
	}
	if (Validator.isEmpty(data.lastName)) {
		errors.lastName = 'Last Name field is required';
	}
	//validator function isLength(string, {}) .
	if (!Validator.isLength(data.firstName, {min: 2, max: 30})) {
		errors.firstName = 'First Name must be minimun 2 characters';
	}
	//validator function isLength(string, {}) .
	if (!Validator.isLength(data.lastName, {min: 2, max: 30})) {
		errors.lastName = 'First Name must be minimun 2 characters';
	}

	if (Validator.isEmpty(data.email)) {
		errors.email = 'Email field is required';
	}
	//validator function isEmail(string) .
	if (!Validator.isEmail(data.email)) {
		errors.email = 'Email is invalid';
	}

	if (Validator.isEmpty(data.phoneNumber)) {
		errors.phoneNumber = 'Phone Number field is required';
	}
	if (Validator.isEmpty(data.companyName)) {
		errors.companyName = 'Comapany Name field is required';
	}

	if(data.type === 1){
		data.password = !isEmpty(data.password) ? data.password : '';
		data.password2 = !isEmpty(data.password2) ? data.password2 : '';
		if (Validator.isEmpty(data.password)) {
			errors.password = 'Password field is required';
		}
		if (!Validator.isLength(data.password, {min: 6, max: 30})) {
			errors.password = 'Password must be at least 6 characters';
		}
	
	
		if (Validator.isEmpty(data.password2)) {
			errors.password2 = 'Confirm Password field is required';
		}
		//validator function equals(string1, string2) .
		if (!Validator.equals(data.password, data.password2)) {
			errors.password2 = 'Passwords must match';
		}
	}

	return {
		errors,
		isValid: isEmpty(errors)
	};
};