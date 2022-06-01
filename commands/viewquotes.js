const { MessageEmbed } = require('discord.js');

module.exports = {
    category: 'Moses quotes',
    description: 'Display all the currently stored Moses Quotes',

    slash: true,
    testOnly: true,

    callback: ({ interaction }) => {
        const viewquotesEmbed = new MessageEmbed()
            .setColor('RANDOM')
            .setTitle('Here are all the currently stored Moses Quotes:')
            .setDescription('quotes db')
            .setTimestamp()
            .setFooter({ text: 'Moses Quote DB', iconURL: 'https://cdn.discordapp.com/avatars/315531146953752578/c74e42cfa5ab08a5daa5ede7365e2244.png?size=4096' });
        if (interaction) {
            interaction.reply({
                embeds: [viewquotesEmbed]
            });
        }
    }
};