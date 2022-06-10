const quotesSchema = require('../schemas/quotes-schema');
const { Webhook, MessageBuilder } = require('discord-webhook-node');



module.exports = function sendQuote() {

    let randomQuote, randomDocumentIndex, date, lastUsed;


    const mongo = require('./mongo');

    const connectToMongoDB = async() => {
        await mongo().then(async(mongoose) => {
            try {
                console.log('Connected to mongodb!');

                let dbArray = await quotesSchema.find({});

                randomDocumentIndex = Math.floor(Math.random() * dbArray.length);

                randomQuote = dbArray[randomDocumentIndex]['quote'];
                date = dbArray[randomDocumentIndex]['date'];
                lastUsed = dbArray[randomDocumentIndex]['lastUsed'];


                await quotesSchema.updateOne({
                    quoteId: randomDocumentIndex + 1
                }, {
                    lastUsed: Date.now()
                });


                console.log(`\nChose: ${randomQuote}\nSaid: ${date}\n`);

                const color = ["#ff00ff", "#ff0000", "#ff6f00", "#fff200", "#33ff00", "#00c8ff", "#8c00ff"];
                //sun mon tue wed thu fri sat

                const hook = new Webhook(process.env.DAILY_WEBHOOK_URL);

                const embed = new MessageBuilder()
                    .setTitle(`"${randomQuote}"`)
                    // .setText(` <@&980815178813820988> Here is a random Moses quote for today!\`#${randomDocumentIndex + 1}\``)
                    .setText("SIKE! No quote, just testing.")
                    .setColor(color[new Date().getDay()])
                    .setFooter('Said by Moses on', 'https://cdn.discordapp.com/attachments/980813644948463656/980822911600447558/moses.jpeg?size=4096')
                    .setTimestamp(date);

                console.log(`\nSending quote #${randomDocumentIndex + 1}\n"${randomQuote}"\nIt was said: ${date}
lastUsed:\n${Date.now() - lastUsed.getTime()} ms ago
${(Date.now() - lastUsed.getTime()) / 1000} s ago
${(Date.now() - lastUsed.getTime()) / (1000 * 60)} min ago
${(Date.now() - lastUsed.getTime()) / (1000 * 60 * 60)} h ago
${(Date.now() - lastUsed.getTime()) / (1000 * 60 * 60 * 24)} days ago`);


                hook.send(embed);


            } finally {
                mongoose.connection.close();
            }
        });
    };

    connectToMongoDB();
};