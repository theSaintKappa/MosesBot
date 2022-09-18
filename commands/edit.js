const quotesSchema = require('../schemas/quotes-schema');
const { PermissionsBitField } = require('discord.js');

// TODO: clean this up this mess

module.exports = {
    category: 'MosesDB',
    description: 'Edit a quote from the MosesDB',
    slash: true,
    testOnly: true,
    options: [{
            name: 'quote-id',
            description: 'Provide an id for the quote you would like to edit. To check a quote\'s id run: /quotes',
            required: true,
            type: 'NUMBER',
        },
        {
            name: 'new-quote',
            description: 'What would you like to edit the quote to?',
            required: true,
            type: 'STRING',
        }
    ],

    callback: async({ interaction, args, member }) => {
        const quoteToEdit = await quotesSchema.findOne({
            quoteId: args[0]
        });

        let response = '';

        // TODO: clean up this mess of a code

        if (!member.permissions.has(PermissionsBitField.Flags.Administrator)) {

            if (quoteToEdit['submitterId'] == member.id) {

                await quotesSchema.updateOne({
                    quoteId: args[0]
                }, {
                    quote: args[1]
                });

                response += `Quote **#${args[0]}** was updated to "\`${args[1]}\`"`;

            } else {

                response += `Unfortunately quote **#${args[0]}** was submitted by <@${quoteToEdit['submitterId']}>.\nIf you want it edited ask them or a server admin.`;

            }

        } else {

            await quotesSchema.updateOne({
                quoteId: args[0]
            }, {
                quote: args[1]
            });

            response += `Quote **#${args[0]}** was updated to "\`${args[1]}\`" (admin mode)`;

        }



        if (interaction) {
            interaction.reply({
                content: response
            });
        }

    }
};