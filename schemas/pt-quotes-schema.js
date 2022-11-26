const mongoose = require("mongoose");

const schema = new mongoose.Schema({
    quoteeId: {
        type: String,
        required: true,
    },
    quote: {
        type: String,
        required: true,
    },
    dateAdded: {
        type: Date,
        required: true,
    },
    quoteId: {
        type: Number,
        required: false,
    },
    submitterId: {
        type: String,
        required: true,
    },
});

module.exports = mongoose.model("pt-quotes", schema, "pt-quotes");
