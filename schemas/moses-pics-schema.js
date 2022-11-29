const mongoose = require("mongoose");

const schema = new mongoose.Schema({
    fileUrl: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: false,
    },
    uploadDate: {
        type: Date,
        required: true,
    },
    uploader: {
        userName: {
            type: String,
            required: true,
        },
        userId: {
            type: String,
            required: true,
        },
    },
    fileSize: {
        type: Number,
        required: true,
    },
    fileDimensions: {
        width: {
            type: Number,
            required: true,
        },
        height: {
            type: Number,
            required: true,
        },
    },
    contentType: {
        type: String,
        required: true,
    },
    fileName: {
        type: String,
        required: true,
    },
});

module.exports = mongoose.model("moses-pics-schema", schema, "moses-pics-schema");
