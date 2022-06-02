const quotesSchema = require('../quotes-schema');
const { Webhook, MessageBuilder } = require('discord-webhook-node');



module.exports = function sendQuote() {

    let randomQuote, randomDocumentIndex, date;


    const mongo = require('./mongo');

    const connectToMongoDB = async() => {
        await mongo().then(async(mongoose) => {
            try {
                console.log('Connected to mongodb!');

                let dbArray = await quotesSchema.find({});

                randomDocumentIndex = Math.floor(Math.random() * dbArray.length);

                randomQuote = dbArray[randomDocumentIndex]['quote'];
                date = dbArray[randomDocumentIndex]['date'];


                console.log(`\nChose: ${randomQuote}\nSaid: ${date}\n`);

                const color = ["#ff00ff", "#ff0000", "#ff6f00", "#fff200", "#33ff00", "#00c8ff", "#8c00ff"];
                //sun mon tue wed thu fri sat

                const hook = new Webhook("https://discord.com/api/webhooks/980816057419833365/w4ui_9JDKRbyZC8qRsDTDZDthb6m-2_aCD4jYe26Z3u0b-wgMNgZUweYZKTg2_JWrByP");

                const embed = new MessageBuilder()
                    .setTitle(`"${randomQuote}"`)
                    .setText(` <@&980814138869698641> Here is a random Moses quote for today!\`#${randomDocumentIndex + 1}\``)
                    .setColor(color[new Date().getDay()])
                    .setFooter('Said by Moses on', 'https://cdn.discordapp.com/attachments/980813644948463656/980822911600447558/moses.jpeg?size=4096')
                    .setTimestamp(date);

                console.log(`\nSending quote #${randomDocumentIndex + 1}\n"${randomQuote}"\nIt was said: ${date}\n`);
                // hook.send(embed);


            } finally {
                mongoose.connection.close();
            }
        });
    };

    connectToMongoDB();
};