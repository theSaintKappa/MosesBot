const mongoose = require("mongoose");

const schema = new mongoose.Schema({
    usedQuoteId: {
        type: Number,
        required: true,
    },
    usedDate: {
        type: Date,
        required: true,
    },
});

module.exports = mongoose.model("moses-last-used", schema, "moses-last-used");
