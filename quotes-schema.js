const mongoose = require('mongoose');

const schema = new mongoose.Schema({
    quote: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    quoteId: {
        type: Number,
        required: false
    }
});

module.exports = mongoose.model('quotes', schema, 'quotes');