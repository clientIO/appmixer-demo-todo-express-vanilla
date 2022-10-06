const mongoose = require('mongoose')
const User = require('./user');

const schema = new mongoose.Schema({
    url: {
        type: String,
        required: true
    },
    userId: {
        type: mongoose.ObjectId,
        ref: User,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = new mongoose.model('Webhook', schema);
