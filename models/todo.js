const mongoose = require('mongoose');
const User = require('./user');

const schema = new mongoose.Schema({
    item: {
        type: String,
        required: true
    },
    userId: {
        type: mongoose.ObjectId,
        ref: User,
        required: true
    },
    status: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = new mongoose.model('Todo', schema);
