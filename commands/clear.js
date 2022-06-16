const { Permissions, MessageEmbed } = require('discord.js');

module.exports = {
    category: 'MosesUtilities',
    description: 'Clear a specified number of message from the current channel.',

    options: [{
        name: 'number-of-messages',
        description: 'Provide an number of messages you would like to delete from the current channel.',
        required: true,
        type: 'NUMBER',
    }],

    slash: true,
    testOnly: true,

    callback: async({ interaction, channel, args }) => {


        const clearEmbed = new MessageEmbed()
            .setColor('RANDOM')
            .setTimestamp()
            .setFooter({ text: 'MosesUtilities', iconURL: 'https://cdn.discordapp.com/avatars/315531146953752578/c74e42cfa5ab08a5daa5ede7365e2244.png?size=4096' });


        try {
            const { size } = await channel.bulkDelete(args[0], true);
            clearEmbed.setTitle(`:broom: Cleared ${size} message(s)!`);

        } catch (err) {
            clearEmbed.setTitle(`:no_entry: Provide a number greater than zero.`);
        }



        if (interaction) {
            await interaction.reply({
                embeds: [clearEmbed]
            });
        }

        setTimeout(() => { interaction.deleteReply(); }, 5000);

    }
};