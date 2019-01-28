const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Create Schema
const CarSchema = new Schema({
    make: {
        type: String,
        required: true
    },
    model: {
        type: String,
        required: true
    },
    year: {
        type: String,
    },
    in_color: {
        type: String,
    },
    ex_color: {
        type: String,
    },
    km: {
        type: String,
    },
    body_type: {
        type: String,
    },
    transmission: {
        type: String,
    },
    drivetrain: {
        type: String,
    },
    fuel_type: {
        type: String,
    },
    engine: {
        type: String,
    },
    doors: {
        type: String,
    },
    cylinders: {
        type: String,
    },
    VIN: {
        type: String,
    },
    price: {
        type: String,
        required: true
    },
    description: {
        type: String,
    },
    sold: {
        type: String,
        default: 'sale'
    }, 
    primeImg: {
        type: String,
        default: ''
    }, 

    date: {
        type: Date,
        default: Date.now
    }
});

module.exports = Car = mongoose.model('cars', CarSchema); 