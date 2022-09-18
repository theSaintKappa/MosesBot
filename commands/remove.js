// const { EmbedBuilder } = require('discord.js');
const quotesSchema = require('../schemas/quotes-schema');
const counterSchema = require('../schemas/counter-schema');
const leaderboardSchema = require('../schemas/quote-leaderboard-schema');
const { PermissionsBitField } = require('discord.js');

// TODO: clean this up this mess

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


    callback: async({ interaction, args, user, member, client }) => {

        let response = '';


        const quoteToEdit = await quotesSchema.findOne({
            quoteId: args[0]
        });
        // Check if document exists
        if (await quotesSchema.find({ quoteId: args }) != '') {

            if (!member.permissions.has(PermissionsBitField.Flags.Administrator)) {

                if (quoteToEdit['submitterId'] == member.id) {

                    // Deleting specified document from the "quotes" collection
                    await quotesSchema.deleteOne({
                        quoteId: args
                    });

                    // Subtracting 1 from the auto increment counter in the "quote-counter" collection so that when you add a new quote it doesn't skip a number
                    // Like id does in SQL
                    await counterSchema.updateOne({}, {
                        $inc: { seq_value: -1 }
                    });

                    // Update the leaderboards cause no free points
                    await leaderboardSchema.updateOne({
                        userId: user.id
                    }, {
                        $inc: { count: -1 }
                    });

                    response += `Quote **#${quoteToEdit['quoteId']} →** "\`${quoteToEdit['quote']}\`" has been **permanently deleted**.`;

                } else {

                    response += `Unfortunately quote **#${args[0]}** was submitted by <@${quoteToEdit['submitterId']}>.\nIf you want it deleted ask them or a server admin.`;

                }

            } else {

                await quotesSchema.deleteOne({
                    quoteId: args
                });

                // Subtracting 1 from the auto increment counter in the "quote-counter" collection so that when you add a new quote it doesn't skip a number
                // Like id does in SQL
                await counterSchema.updateOne({}, {
                    $inc: { seq_value: -1 }
                });

                // Update the leaderboards cause no free points
                await leaderboardSchema.updateOne({
                    userId: user.id
                }, {
                    $inc: { count: -1 }
                });
                response += `Quote **#${quoteToEdit['quoteId']} →** "\`${quoteToEdit['quote']}\`" has been **permanently deleted** (admin mode).`;

            }

        } else {
            response = `Quote with the id **\`${args}\`** doesn't exist.`;
        }


        if (interaction) {
            interaction.reply({
                content: response
            });
        }

        const quotesCount = await quotesSchema.countDocuments({})
        await client.channels.cache.get('990343138268819497').setName(`Quotes ›› ${quotesCount.toLocaleString()}`)
    }
};