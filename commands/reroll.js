const { EmbedBuilder, ApplicationCommandOptionType } = require('discord.js');
const { sendQuote } = require('../cron/daily-quote');
const { CommandType } = require('wokcommands');

module.exports = {
    description: "Re-roll today's daily quote",
    type: CommandType.SLASH,
    testOnly: true,
    options: [
        {
            name: 'delete-last-quote',
            description: 'Do you want to delete the last quote sent in the channel?',
            required: false,
            type: ApplicationCommandOptionType.String,
            choices: [
                { name: 'Delete last quote', value: 'true' },
                { name: "Don't delete last quote", value: 'false' },
            ],
        },
    ],

    callback: async ({ args, client }) => {
        let embed = new EmbedBuilder();

        try {
            if (args[0] === 'true') await client.channels.cache.get('980813191556780064').bulkDelete(1);

            sendQuote(client);

            embed.setColor('#c756ff');
            embed.setAuthor({
                name: "Re-rolled today's quote.",
                iconURL: 'https://cdn.discordapp.com/attachments/980813644948463656/986291948430164028/mosesSpinHD.gif',
            });
        } catch (err) {
            console.error(err);

            embed.setTitle(`An error occurred while processing your request.`);
            embed.setColor('#ff0000');
        }

        return {
            embeds: [embed],
            ephemeral: true,
        };
    },
};
