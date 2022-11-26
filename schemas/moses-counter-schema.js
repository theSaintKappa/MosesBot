const mongoose = require("mongoose");

const schema = new mongoose.Schema({
    seq_value: {
        type: Number,
        required: true,
    },
});

module.exports = mongoose.model("moses-counter", schema, "moses-counter");
