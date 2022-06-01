const { MessageEmbed } = require('discord.js');

module.exports = {
    category: 'Moses quotes',
    description: 'Add a quote to the MosesDB', // Required for slash commands

    slash: true,
    testOnly: true,

    minArgs: 1,
    maxArgs: 1,
    expectedArgs: '<quote>',


    callback: ({ interaction, args }) => {
        const addquoteEmbed = new MessageEmbed()
            .setColor('RANDOM')
            .setTitle(`Added \`${args}\` to the Moses Quotes DB!`)
            .setDescription('You can view all Moses Quotes by using `/viewquotes`')
            .setTimestamp()
            .setFooter({ text: 'Moses Quote DB', iconURL: 'https://cdn.discordapp.com/avatars/315531146953752578/c74e42cfa5ab08a5daa5ede7365e2244.png?size=4096' });

        if (interaction) {
            interaction.reply({
                embeds: [addquoteEmbed]
            });
        }
    }
};