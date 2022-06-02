const mongoose = require('mongoose')

const schema = new mongoose.Schema({
    url: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = new mongoose.model('Webhook', schema);
