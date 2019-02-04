const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Create Schema
const ProfileSchema = new Schema({ 
    user: {
        type: Schema.Types.ObjectId,
        ref: 'users'
    },
    user_id: {
        type: String, 
    },
    type: {
        type: String, 
    },
    date: {
        type: Date,
        default: Date.now
    }

});

module.exports = Pofile = mongoose.model('profile', ProfileSchema);