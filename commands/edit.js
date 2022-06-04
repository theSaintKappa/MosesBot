const quotesSchema = require('../quotes-schema');

module.exports = {
    category: 'MosesDB',
    description: 'Edit a specified quote from the MosesDB',

    slash: true,
    testOnly: true,

    options: [{
        name: 'quote-id',
        description: 'Provide an id for the quote you would like to edit. To check a quote\'s id run: /quotes',
        required: true,
        type: 'NUMBER',
    }],


    callback: async({ interaction, args, user }) => {
        if (interaction) {
            interaction.reply({
                content: 'This command is work in progress.'
            });
        }
    }
};