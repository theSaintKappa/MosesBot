const { MessageEmbed } = require('discord.js');
const quotesSchema = require('../schemas/quotes-schema');
const leaderboardSchema = require('../schemas/quote-leaderboard-schema');

module.exports = {
    category: 'MosesDB',
    description: 'Add a new quote to the MosesDB',

    slash: true,
    testOnly: true,

    options: [{
        name: 'quote',
        description: 'Provide a quote to add to the MosesDB',
        required: true,
        type: 'STRING',
    }],


    callback: async({ interaction, args, user }) => {
        const addquoteEmbed = new MessageEmbed()
            .setColor('RANDOM')
            .setTitle(`Added:\n"**\`${args}\`**"\nto the MosesDB!`)
            .setDescription('*You can view all Moses Quotes by using* **`/quotes`**')
            .setTimestamp()
            .setFooter({ text: 'MosesDB', iconURL: 'https://cdn.discordapp.com/avatars/315531146953752578/c74e42cfa5ab08a5daa5ede7365e2244.png?size=4096' });

        if (interaction) {
            interaction.reply({
                embeds: [addquoteEmbed]
            });
        }


        await new quotesSchema({
            quote: args.toString(),
            date: new Date(),
            submitterName: user.username,
            submitterId: user.id,
            lastUsed: new Date(0).getTime()
        }).save();


        const leaderboard = await leaderboardSchema.find({ userId: user.id });
        if (leaderboard == '') {
            await new leaderboardSchema({
                userId: user.id,
                userName: user.username,
                count: 1
            }).save();
            return;
        }
        await leaderboardSchema.updateOne({
            userId: user.id
        }, {
            $inc: { count: 1 }
        });
    }
};