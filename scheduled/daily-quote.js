const quotesSchema = require('../schemas/moses-quotes-schema');
const lastUsedSchema = require('../schemas/moses-last-used-schema');
const { EmbedBuilder } = require('discord.js');

const sendQuote = async (client) => {
    const quotesArray = await quotesSchema.find({});

    const chosenQuote = quotesArray[Math.floor(Math.random() * quotesArray.length)];

    const quoteDate = new Date(chosenQuote.date);
    const day = {
        1: { weekday: 'monday', color: '#ff0000' },
        2: { weekday: 'CHEWSDAY', color: '#ff6f00' },
        3: { weekday: 'wednesday', color: '#fff200' },
        4: { weekday: 'thursday', color: '#33ff00' },
        5: { weekday: 'friday', color: '#00c8ff' },
        6: { weekday: 'saturday', color: '#8c00ff' },
        0: { weekday: 'sunday', color: '#ff00ff' },
    };
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const getOrdinal = (day) => {
        return day + (day > 0 ? ['th', 'st', 'nd', 'rd'][(day > 3 && day < 21) || day % 10 > 3 ? 0 : day % 10] : '');
    };

    const embed = new EmbedBuilder()
        .setColor(day[new Date().getDay()].color)
        .setTitle(`**\`#${chosenQuote.quoteId}\`** ${chosenQuote.quote}`)
        .setFooter({ text: `It was said on ${day[quoteDate.getDay()].weekday} ${getOrdinal(quoteDate.getDate())} ${months[quoteDate.getMonth()]} ${quoteDate.getFullYear()}.` });

    try {
        await client.channels.cache.get('980813191556780064').send({ embeds: [embed], content: `Hey <@&980815178813820988>, here is today's random Moses Quote!` });

        console.log(`[Moses Quotes] Sent quote #${chosenQuote.quoteId} ${chosenQuote.quote.slice(0, 16)}...`);

        await new lastUsedSchema({
            usedQuoteId: chosenQuote.quoteId,
            usedDate: new Date().getTime(),
        })
            .save()
            .then(() => {
                console.log(`[Moses Quotes] Saved quote #${chosenQuote.quoteId} to moses-last-used`);
            })
            .catch(() => {
                console.error(`[Error] Failed to save quote #${chosenQuote.quoteId} to moses-last-used`);
            });
    } catch (err) {
        console.error(err);
    }
};

module.exports = { sendQuote };
