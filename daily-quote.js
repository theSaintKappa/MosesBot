const quotesSchema = require("./schemas/moses-quotes-schema");
const lastUsedSchema = require("./schemas/moses-last-used-schema");
const { Webhook, MessageBuilder } = require("discord-webhook-node");

const sendDailyQuote = async () => {
    const quotesArray = await quotesSchema.find({});

    const randomIndex = Math.floor(Math.random() * quotesArray.length);

    const chosenQuote = quotesArray[randomIndex];
    const quoteDate = new Date(chosenQuote.date);

    console.log(`Chose quote #${chosenQuote.quoteId} ${chosenQuote.quote.slice(0, 14)}...`);

    const day = {
        1: { weekday: "monday", color: "#ff0000" },
        2: { weekday: "CHEWSDAY", color: "#ff6f00" },
        3: { weekday: "wednesday", color: "#fff200" },
        4: { weekday: "thursday", color: "#33ff00" },
        5: { weekday: "friday", color: "#00c8ff" },
        6: { weekday: "saturday", color: "#8c00ff" },
        0: { weekday: "sunday", color: "#ff00ff" },
    };
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const getOrdinal = (day) => {
        return day + (day > 0 ? ["th", "st", "nd", "rd"][(day > 3 && day < 21) || day % 10 > 3 ? 0 : day % 10] : "");
    };

    const embed = new MessageBuilder()
        .setText(`Hey <@&980815178813820988>, here is today's random Moses Quote!`)
        .setTitle(`**\`#${chosenQuote.quoteId}\`** ${chosenQuote.quote}`)
        // TODO: Random moses picture in thumbnail
        // .setThumbnail("https://i.imgur.com/AfFp7pu.png")
        .setColor(day[new Date().getDay()].color)
        .setFooter(`It was said on ${day[quoteDate.getDay()].weekday} ${getOrdinal(quoteDate.getDate())} ${months[quoteDate.getMonth()]} ${quoteDate.getFullYear()}.`);

    const webhook = new Webhook(process.env.DAILY_WEBHOOK_URL);
    webhook
        .send(embed)
        .then(async () => {
            console.log("Sent webhook successfully!");

            await new lastUsedSchema({
                usedQuoteId: chosenQuote.quoteId,
                usedDate: new Date().getTime(),
            })
                .save()
                .then(() => {
                    console.log(`Saved quote #${chosenQuote.quoteId} to moses-last-used`);
                })
                .catch(() => {
                    console.error(`!FAILED to save quote #${chosenQuote.quoteId} to moses-last-used`);
                });
        })
        .catch((err) => console.log(err.message));
};

module.exports = { sendDailyQuote };
