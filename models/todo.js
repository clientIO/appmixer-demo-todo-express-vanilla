const mongoose = require('mongoose');
const schema = new mongoose.Schema({
    todo: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    done: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = new mongoose.model('Todo', schema);
