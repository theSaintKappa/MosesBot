<<<<<<< HEAD
const { MessageEmbed } = require('discord.js');
const quotesSchema = require('../quotes-schema');
const counterSchema = require('../counter-schema');

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


    callback: async({ interaction, args }) => {
        // Deleting specified document from the "quotes" collection
        await quotesSchema.deleteOne({
            quoteId: args
        });

        // Subtracting 1 from the auto increment counter in the "quote-counter" collection so that when you add a new quote it doesn't skip a number
        // Like id does in fucking SQL
        await counterSchema.updateOne({}, {
            seq_value: args - 1
        });


        if (interaction) {
            interaction.reply({
                content: `Removed quote ${args}`
            });
        }
    }
=======
const { MessageEmbed } = require('discord.js');
const quotesSchema = require('../quotes-schema');
const counterSchema = require('../counter-schema');

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


    callback: async({ interaction, args }) => {
        // Deleting specified document from the "quotes" collection
        await quotesSchema.deleteOne({
            quoteId: args
        });

        // Subtracting 1 from the auto increment counter in the "quote-counter" collection so that when you add a new quote it doesn't skip a number
        // Like id does in fucking SQL
        await counterSchema.updateOne({}, {
            seq_value: args - 1
        });


        if (interaction) {
            interaction.reply({
                content: `Removed quote ${args}`
            });
        }
    }
>>>>>>> 51f13337faa0ed7b6d60ce3ca1cd928ad2f31b42
};