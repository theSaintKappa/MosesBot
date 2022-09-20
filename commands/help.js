const { EmbedBuilder } = require('discord.js');

module.exports = {
    category: 'MosesUtilities',
    description: 'List all the available Moses commands',

    slash: true,
    testOnly: true,

    callback: async({ interaction }) => {
        const embed = new EmbedBuilder()
            .setTitle('MosesBot command help:')
            .setColor('Random')
            .setURL('https://moses.gq/')
            .setThumbnail('https://cdn.discordapp.com/attachments/980813644948463656/982458232306032700/3.jpg?size=4096')
            .setDescription('ㅤ')
            .addFields({ name: 'MosesDB related commands', value: '╒═══════════════════════╕', inline: false }, { name: '/add', value: 'Add a new quote to the MosesDB', inline: true }, { name: '/remove', value: 'Remove a specified quote from the MosesDB', inline: true }, { name: '/quotes', value: 'Display all the currently stored Moses Quotes', inline: true }, { name: '/leaderboard', value: 'Display a leaderboard of who added the most Moses quotes to the database', inline: true }, { name: '╘═══════════════════════╛', value: 'ㅤ', inline: false }, { name: 'MosesUtilities commands', value: '╒═══════════════════════╕', inline: false }, { name: '/reroll', value: 'Re-roll today\'s daily quote', inline: true }, { name: '/goodnight', value: 'Wish everyone a good night sleep', inline: true }, { name: '/status', value: 'Change the bot status', inline: true }, { name: '/help', value: 'Display this menu', inline: true }, { name: '/clear', value: 'Purge messages from the current channel', inline: true }, { name: '/pingspam [start/stop]', value: 'Torture someone via discord mentions', inline: true }, { name: '╘═══════════════════════╛', value: 'ㅤ', inline: false })
            .setFooter({ text: 'Bot made by: SaintKappa#7400', iconURL: 'https://cdn.discordapp.com/avatars/315531146953752578/a_15f39d41ad74001f0596bddc61c89847.png?size=4096' });
        if (interaction) {
            interaction.reply({
                embeds: [embed],
                ephemeral: true
            });
        }
    }
};