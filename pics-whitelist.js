const whitelistSchema = require('./models/pics-uploaders-whitelist-schema');
let picsUploadersWhitelist;

module.exports = {
    fetch: async () => {
        return new Promise(async (resolve, reject) => {
            try {
                const whitelistColection = await whitelistSchema.find({}, { 'user.id': 1, _id: 0 });
                picsUploadersWhitelist = whitelistColection.map((doc) => doc.user.id);
                console.log('Succesfully fetched pics uploaders whitelist.');
                resolve();
            } catch (err) {
                console.log(err);
                reject(err);
            }
        });
    },
    get: () => picsUploadersWhitelist,
};
