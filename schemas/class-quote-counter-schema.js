const mongoose = require('mongoose');

const schema = new mongoose.Schema({
    seq_value: {
        type: Number,
        required: true
    }
});

module.exports = mongoose.model('class-quote-counter', schema, 'class-quote-counter');