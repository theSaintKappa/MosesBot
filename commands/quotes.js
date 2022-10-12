const { EmbedBuilder } = require('discord.js');
const quotesSchema = require('../schemas/quotes-schema');

module.exports = {
    category: 'MosesDB',
    description: 'Display all the currently stored Moses Quotes',

    slash: true,
    testOnly: true,

    callback: async({ interaction }) => {

        const quotesArray = await quotesSchema.find().sort({ quoteId: -1 });
        var quotesString = '';

        quotesArray.every(quote => {
            if (!(quotesString.length > 4000)) {
                quotesString += `**#${quote['quoteId']}** \`${quote['quote']}\`(submitted by <@${quote['submitterId']}>)\n`;
                return true;
            }
            quotesString += '***+more***';
            return false;
        });

        const viewquotesEmbed = new EmbedBuilder()
            .setColor('Random')
            .setDescription(quotesString)
            .setTimestamp()
            .setFooter({ text: 'MosesDB', iconURL: 'https://cdn.discordapp.com/avatars/315531146953752578/c74e42cfa5ab08a5daa5ede7365e2244.png?size=4096' });

        if (quotesString == '') {
            viewquotesEmbed.setTitle('The MosesDB is empty! Add a quote by running \`/add\`');
        } else {
            viewquotesEmbed.setTitle('Here are all the currently stored Moses Quotes (in descending order):');
        }

        if (interaction) {
            interaction.reply({
                embeds: [viewquotesEmbed]
            });
        }
    }
};