const Validator = require('validator');
const isEmpty = require('./isEmpty');

module.exports = function validateRegisterInput(data) {
	let errors = [];

	data.make = !isEmpty(data.make) ? data.make : '';
	data.model = !isEmpty(data.model) ? data.model : '';
	data.price = !isEmpty(data.price) ? data.price : ''; 

 	if (Validator.isEmpty(data.make)) {
		errors.push('make field is required');
	}  
	if (Validator.isEmpty(data.model)) {
		errors.push('model field is required');
	}
	if (Validator.isEmpty(data.price)) {
		errors.push('price field is required');
	}
  
	return {
		errors,
		isValid: isEmpty(errors)
	};
};