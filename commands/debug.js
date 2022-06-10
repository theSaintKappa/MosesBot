const { MessageEmbed } = require('discord.js');
const quotesSchema = require('../schemas/quotes-schema');

module.exports = {
    category: 'MosesDB',
    description: '/quotes but made for debugging',

    slash: true,
    testOnly: true,
    ownerOnly: true,

    callback: async({ interaction }) => {

        const quotesArray = await quotesSchema.find({});
        var quotesString = '';

        quotesArray.every(quote => {
            quotesString += `**Q #${quote['quoteId']}** \`${quote['quote']}\`\n**Submitter**: <@${quote['submitterId']}>\n**Last Used**: \`${quote['lastUsed'].toUTCString()}\` **->** \`${quote['lastUsed'].getTime()}\`\n\n`;
            if (quotesString.length > 4000) {
                quotesString += '***+more***';
                return false;
            } else return true;
        });

        const viewquotesEmbed = new MessageEmbed()
            .setColor('RANDOM')
            .setDescription(quotesString)
            .setTimestamp()
            .setFooter({ text: 'MosesDB', iconURL: 'https://cdn.discordapp.com/avatars/315531146953752578/c74e42cfa5ab08a5daa5ede7365e2244.png?size=4096' });

        if (quotesString == '') {
            viewquotesEmbed.setTitle('The MosesDB is empty! Add a quote by running \`/add\`');
        } else {
            viewquotesEmbed.setTitle(':beetle: DEBUG MODE :beetle: | Collection "quotes" contents:');
        }

        if (interaction) {
            interaction.reply({
                embeds: [viewquotesEmbed]
            });
        }
    }
};