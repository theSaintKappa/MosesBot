<<<<<<< HEAD
const { MessageEmbed } = require('discord.js');
const leaderboardSchema = require('../quote-leaderboard-schema');

module.exports = {
    category: 'MosesDB',
    description: 'Display a leaderboard of who added the most Moses quotes to the database',

    slash: true,
    testOnly: true,

    callback: async({ interaction }) => {
        const leaderboardArray = await leaderboardSchema.find().sort({ count: -1 });
        var leaderboardString = '';

        leaderboardArray.forEach(async(user) => {
            leaderboardString += `**#${leaderboardArray.indexOf(user) + 1}** <@${user['userId']}> **→** **\`${user['count']}\`**\n`;
        });



        const leaderboardEmbed = new MessageEmbed()
            .setColor('RANDOM')
            .setTitle('Here is the current state of the leaderboard:')
            .setDescription(leaderboardString)
            .setTimestamp()
            .setFooter({ text: 'MosesLeaderboards', iconURL: 'https://cdn.discordapp.com/avatars/315531146953752578/c74e42cfa5ab08a5daa5ede7365e2244.png?size=4096' });

        if (leaderboardString == '') {
            leaderboardEmbed.serTitle('The leaderboard is empty!');
        }

        if (interaction) {
            interaction.reply({
                embeds: [leaderboardEmbed]
            });
        }
    }
=======
const { MessageEmbed } = require('discord.js');
const leaderboardSchema = require('../quote-leaderboard-schema');

module.exports = {
    category: 'MosesDB',
    description: 'Display a leaderboard of who added the most Moses quotes to the database',

    slash: true,
    testOnly: true,

    callback: async({ interaction }) => {
        const leaderboardArray = await leaderboardSchema.find().sort({ count: -1 });
        var leaderboardString = '';

        leaderboardArray.forEach(async(user) => {
            leaderboardString += `**#${leaderboardArray.indexOf(user) + 1}** <@${user['userId']}> **→** **\`${user['count']}\`**\n`;
        });



        const leaderboardEmbed = new MessageEmbed()
            .setColor('RANDOM')
            .setTitle('Here is the current state of the leaderboard:')
            .setDescription(leaderboardString)
            .setTimestamp()
            .setFooter({ text: 'MosesLeaderboards', iconURL: 'https://cdn.discordapp.com/avatars/315531146953752578/c74e42cfa5ab08a5daa5ede7365e2244.png?size=4096' });

        if (leaderboardString == '') {
            leaderboardEmbed.serTitle('The leaderboard is empty!');
        }

        if (interaction) {
            interaction.reply({
                embeds: [leaderboardEmbed]
            });
        }
    }
>>>>>>> 51f13337faa0ed7b6d60ce3ca1cd928ad2f31b42
};