const Validator = require('validator');
const isEmpty = require('./isEmpty');

module.exports = function validateCandidatePosting(data) {
    let errors = {};

    if (data.candidateId == null) {
        errors.candidateId = "Candidate Id is required"
    }
    if (data.postId == null) {
        errors.postId = "Post Id is required"
    }
    return {
        errors,
        isValid: isEmpty(errors)
    };
};