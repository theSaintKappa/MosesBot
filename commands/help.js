const { MessageEmbed } = require('discord.js');
const sendQuote = require('../webhook/webhook-daily');

module.exports = {
    category: 'Moses quotes',
    description: 'List all the available Moses commands',

    slash: true,
    testOnly: true,

    callback: async({ interaction }) => {
        const embed = new MessageEmbed()
            .setTitle('MosesBot command help:')
            .setURL('https://thesaintkappa.github.io/dmqbot/')
            .setThumbnail('https://cdn.discordapp.com/attachments/980813644948463656/982458232306032700/3.jpg?size=4096')
            .addField('/add', 'Add a new quote to the MosesDB', true)
            .addField('/remove', 'Remove a specified quote from the MosesDB', true)
            .addField('/quotes', 'Display all the currently stored Moses Quotes', true)
            .addField('/reroll', 'Re-roll today\'s daily quote', true)
            .addField('/goodnight', 'Wish everyone a good night sleep', true)
            .addField('/status', 'Change the bot status', true)
            .setFooter({ text: 'Bot made by: SaintKappa#7400', iconURL: 'https://cdn.discordapp.com/avatars/315531146953752578/a_15f39d41ad74001f0596bddc61c89847.png?size=4096' });
        if (interaction) {
            interaction.reply({
                embeds: [embed],
                ephemeral: true
            });
        }
    }
};