const { EmbedBuilder } = require('discord.js');
const quotesSchema = require('./models/moses-quotes-schema');
const axios = require('axios');

const colors = {
    1: '#ff6666',
    2: '#ffa866',
    3: '#fff766',
    4: '#85ff66',
    5: '#66deff',
    6: '#ba66ff',
    0: '#ff66ff',
};

module.exports = async (client) => {
    let quote = await quotesSchema.aggregate([{ $sample: { size: 1 } }]);
    quote = quote[0];
    const randomPic = await axios.get('https://api.saintkappa.xyz/moses/pics/random?json=true');

    const embed = new EmbedBuilder()
        .setColor(colors[new Date().getDay()])
        .setTitle(`**\`#${quote.quoteId}\`** ${quote.quote}`)
        .setThumbnail(randomPic.data.url)
        .setDescription(`\u200B\nUploaded by <@${quote.submitterId}> on <t:${Math.floor(quote.date.getTime() / 1000)}:d>`);

    const message = await client.channels.cache.get('980813191556780064').send({ embeds: [embed], content: `Hiya <@&980815178813820988>, here is today's random Moses Quote!` });
    await message.react('<:upvote:982630993997496321>');
    await message.react('<:downvote:982630978566639616>');

    console.log(`[Moses Quotes] Sent quote #${quote.quoteId} ${quote.quote.slice(0, 16)}...`);
};
