const { EmbedBuilder, ApplicationCommandOptionType } = require("discord.js");
const { sendDailyQuote } = require("../scheduled/daily-quote");
const { CommandType } = require("wokcommands");
const autocomplete = ["Delete last quote", "Don't delete last quote"];

module.exports = {
    description: "Re-roll today's daily quote",
    type: CommandType.SLASH,
    testOnly: true,
    options: [
        {
            name: "delete-last-quote",
            description: "Do you want to delete the last quote sent in the channel?",
            required: true,
            type: ApplicationCommandOptionType.String,
            autocomplete: true,
        },
    ],

    autocomplete: () => autocomplete,

    callback: async ({ args, client }) => {
        let embed = new EmbedBuilder();

        if (args[0] === autocomplete[0]) {
            const quotesChannel = client.channels.cache.get("980813191556780064"); // quotes channel
            try {
                await quotesChannel.bulkDelete(1);
                sendDailyQuote();

                embed.setColor("#c756ff");
                embed.setAuthor({
                    name: "Re-rolled today's quote & removed the last one.",
                    iconURL: "https://cdn.discordapp.com/attachments/980813644948463656/986291948430164028/mosesSpinHD.gif",
                });
            } catch (err) {
                console.error(err);

                embed.setTitle(`An error occurred while processing your request.`);
                embed.setColor("#ff0000");
            }
            return {
                embeds: [embed],
                ephemeral: true,
            };
        }

        sendDailyQuote();
        embed.setAuthor({
            name: "Re-rolled today's quote",
            iconURL: "https://cdn.discordapp.com/attachments/980813644948463656/986291948430164028/mosesSpinHD.gif",
        });

        return {
            embeds: [embed],
            ephemeral: true,
        };
    },
};
