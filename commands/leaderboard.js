const { MessageEmbed } = require('discord.js');
const leaderboardSchema = require('../quote-leaderboard-schema');

// możesz zobaczyć jak /quotes jest zrobionbe żeby to zrobić jakby co


module.exports = {
    category: 'Messages leaderboard',
    description: 'Display leaderboard of messages sent',

    slash: true,
    testOnly: true,

    callback: async({ interaction }) => {

        const quotesLbArray = await leaderboardSchema.find({});
        var quotesLbString = '';

        quotesLbArray.every(userName=> {
            quotesLbString += `**#${userName['userId']}** \`${userName['count']}\`\n`;
            if (quotesLbString.length > 4000) {
                quotesLbString += '**+more**';
                return false;
            } else return true;
        });

        const viewleaderboardsEmbed = new MessageEmbed()
            .setColor('RANDOM')
            .setDescription(quotesLbString)
            .setTimestamp()
            .setFooter({ text: 'MosesDB', iconURL: 'https://cdn.discordapp.com/avatars/315531146953752578/c74e42cfa5ab08a5daa5ede7365e2244.png?size=4096' });

        if (quotesString == '') {
            viewleaderboardsEmbed.setTitle('The leaderboard is empty!');
        } else {
            viewleaderboardsEmbed.setTitle('Here is current state of leaderboard:');
        }

        if (interaction) {
            interaction.reply({
                embeds: [viewleaderboardsEmbed]
            });
        }
    }
};