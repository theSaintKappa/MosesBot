const mongo = require('./webhook/mongo');
const quotesSchema = require('./schemas/quotes-schema')

const connectToMongoDB = async() => {
    await mongo().then(async(mongoose) => {
        try {
            console.log('Connected to mongodb!');

            await quotesSchema.updateMany({}, {
                lastUsed: new Date(0).getTime()
            });

        } finally {
            mongoose.connection.close();
        }
    });
};

connectToMongoDB();