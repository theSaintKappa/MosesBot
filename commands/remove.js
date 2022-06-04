// const { MessageEmbed } = require('discord.js');
const quotesSchema = require('../quotes-schema');
const counterSchema = require('../counter-schema');
const leaderboardSchema = require('../quote-leaderboard-schema');

module.exports = {
    category: 'MosesDB',
    description: 'Remove a specified quote from the MosesDB',

    slash: true,
    testOnly: true,

    options: [{
        name: 'quote-id',
        description: 'Provide an id for the quote you would like to remove. To check a quote\'s id run: /quotes',
        required: true,
        type: 'NUMBER',
    }],


    callback: async({ interaction, args, user }) => {

        let response = '';

        // Check if document exists
        if (await quotesSchema.find({ quoteId: args }) != '') {
            response = `Removed quote **\`${args}\`**.`;

            // Deleting specified document from the "quotes" collection
            await quotesSchema.deleteOne({
                quoteId: args
            });

            // Subtracting 1 from the auto increment counter in the "quote-counter" collection so that when you add a new quote it doesn't skip a number
            // Like id does in fucking SQL
            await counterSchema.updateOne({}, {
                $inc: { seq_value: -1 }
            });

            // Update the leaderboards cause no free points
            await leaderboardSchema.updateOne({
                userId: user.id
            }, {
                $inc: { count: -1 }
            });
        } else {
            response = `Quote with the id **\`${args}\`** doesn't exist.`;
        }

        if (interaction) {
            interaction.reply({
                content: response
            });
        }
    }
};