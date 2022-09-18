const { EmbedBuilder } = require('discord.js');
const quotesSchema = require('../schemas/quotes-schema');

module.exports = {
    category: 'MosesDB',
    description: '/quotes but made for debugging',

    slash: true,
    testOnly: true,
    ownerOnly: true,

    callback: async({ interaction, channel }) => {
        const quotesArray = await quotesSchema.find({});
        let content = '';

        if (quotesArray == []) {
            content = 'The MosesDB is empty! Add a quote by running \`/add\`';
        } else {
            content = ':beetle: DEBUG MODE :beetle: | Collection "quotes" contents:';
        }

        if (interaction) {
            interaction.reply({ content });
            for (const quote of quotesArray) {
                const embed = new EmbedBuilder().setDescription(`**Q #${quote['quoteId']}** \`${quote['quote']}\`\n**Submitter**: <@${quote['submitterId']}>\n**Last Used**: \`${quote['lastUsed'].toUTCString()}\` **->** \`${quote['lastUsed'].getTime()}\`\n\n`);

                channel.send({ embeds: [embed] });
            }
        }


    }
};