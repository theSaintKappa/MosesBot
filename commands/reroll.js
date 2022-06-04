const { MessageEmbed } = require('discord.js');
const sendQuote = require('../webhook/webhook-daily');

module.exports = {
    category: 'Moses quotes',
    description: 'Re-roll today\'s daily quote',

    slash: true,
    testOnly: true,

    callback: async({ interaction }) => {
        const viewquotesEmbed = new MessageEmbed()
            .setColor('RANDOM')
            .addField('Re-rolled today\'s quote', '**TODO:** Delete previous quote automatically (optional arg)', true)
            .setTimestamp()
            .setFooter({ text: 'Daily Moses Quote', iconURL: 'https://cdn.discordapp.com/avatars/315531146953752578/c74e42cfa5ab08a5daa5ede7365e2244.png?size=4096' });
        if (interaction) {
            interaction.reply({
                embeds: [viewquotesEmbed]
            });
        }
        sendQuote();
    }
};