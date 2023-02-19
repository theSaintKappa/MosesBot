const mongoose = require('mongoose');

const schema = new mongoose.Schema({
    user: {
        id: {
            type: String,
            required: true,
        },
        username: {
            type: String,
            required: true,
        },
    },
    addedBy: {
        id: {
            type: String,
            required: true,
        },
        username: {
            type: String,
            required: true,
        },
    },
    addedAt: {
        type: Date,
        default: Date.now(),
    },
});

module.exports = mongoose.model('pics-uploaders-whitelist', schema, 'pics-uploaders-whitelist');
