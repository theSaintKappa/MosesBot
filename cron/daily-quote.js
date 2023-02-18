const quotesSchema = require('../models/moses-quotes-schema');
const lastUsedSchema = require('../models/moses-last-used-schema');
const { EmbedBuilder } = require('discord.js');

const sendQuote = async (client) => {
    let quote = await quotesSchema.aggregate([{ $sample: { size: 1 } }]);
    quote = quote[0];

    const day = {
        1: { weekday: 'monday', color: '#ff6666' },
        2: { weekday: 'CHEWSDAY', color: '#ffa866' },
        3: { weekday: 'wednesday', color: '#fff766' },
        4: { weekday: 'thursday', color: '#85ff66' },
        5: { weekday: 'friday', color: '#66deff' },
        6: { weekday: 'saturday', color: '#ba66ff' },
        0: { weekday: 'sunday', color: '#ff66ff' },
    };

    const getOrdinal = (day) => {
        return day + (day > 0 ? ['th', 'st', 'nd', 'rd'][(day > 3 && day < 21) || day % 10 > 3 ? 0 : day % 10] : '');
    };
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    const embed = new EmbedBuilder()
        .setColor(day[new Date().getDay()].color)
        .setTitle(`**\`#${quote.quoteId}\`** ${quote.quote}`)
        .setDescription(`\u200B\nUploaded by <@${quote.submitterId}> on ${day[quote.date.getDay()].weekday} ${getOrdinal(quote.date.getDate())} ${months[quote.date.getMonth()]} ${quote.date.getFullYear()}.`);

    try {
        await client.channels.cache.get('980813191556780064').send({ embeds: [embed], content: `Hiya <@&980815178813820988>, here is today's random Moses Quote!` });

        console.log(`[Moses Quotes] Sent quote #${quote.quoteId} ${quote.quote.slice(0, 16)}...`);

        // await new lastUsedSchema({
        //     usedQuoteId: quote.quoteId,
        //     usedDate: new Date().getTime(),
        // })
        //     .save()
        //     .then(() => {
        //         console.log(`[Moses Quotes] Saved quote #${quote.quoteId} to moses-last-used`);
        //     })
        //     .catch(() => {
        //         console.error(`[Error] Failed to save quote #${quote.quoteId} to moses-last-used`);
        //     });
    } catch (err) {
        console.error(err);
    }
};

module.exports = { sendQuote };
