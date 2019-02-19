const Validator = require('validator');
const isEmpty = require('./isEmpty');

module.exports = function validateCandidatePosting(data) {
    let errors = {};

    if (data.coins == null) {
        errors.coins = "Coins is required"
    }
    else if (!data.coins instanceof Number) {
        errors.coins = "Coins should be number"
    }
    else if (data.coins <= 0) {
        errors.coins = "Coins must be greater than 0"
    }
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