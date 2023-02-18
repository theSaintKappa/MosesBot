const mongoose = require('mongoose');

const schema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    activityType: {
        type: Number,
        required: true,
    },
    activityName: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        required: true,
    },
    updatedAt: {
        type: Date,
        required: true,
    },
});

module.exports = mongoose.model('client-status', schema, 'client-status');
