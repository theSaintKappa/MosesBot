const mongoose = require('mongoose');
require('dotenv').config();
const mongoPath = `${process.env.MONGO_URI}`;

module.exports = async() => {
    await mongoose.connect(mongoPath, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });

    return mongoose;
};