const mongo = require('./webhook/mongo');

const connectToMongoDB = async() => {
    await mongo().then(async(mongoose) => {
        try {
            console.log('Connected to mongodb!');

            const db = mongo.db("test");

            db.createCollection("quote-counter");
        } finally {
            mongoose.connection.close();
        }
    });
};

connectToMongoDB();