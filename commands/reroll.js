const { EmbedBuilder } = require("discord.js");
const { sendDailyQuote } = require("../scheduled/daily-quote");

module.exports = {
    category: "MosesUtilities",
    description: "Re-roll today's daily quote",
    options: [
        {
            name: "delete-last-quote",
            description: "Do you want to delete the last quote sent in the channel?",
            required: false,
            type: 3,
            choices: [
                {
                    name: "Yeah, sure...",
                    value: "true",
                },
                {
                    name: "Naaah, I'm good...",
                    value: "false",
                },
            ],
        },
    ],
    slash: true,
    testOnly: true,
    callback: async ({ interaction, guild, args, client }) => {
        // PLS DON'T LOOK AT THIC CODE
        // I WAS TIERD OK?
        // I WILL FIX IT... someday
        let embed = new EmbedBuilder();

        if (args[0] == "true") {
            const quotesChannel = client.channels.cache.get("980813191556780064"); // quotes channel

            quotesChannel
                .bulkDelete(1)
                .then(() => {
                    embed.setColor("#c756ff");
                    embed.setAuthor({
                        name: "Re-rolled today's quote & removed the last one.",
                        iconURL: "https://cdn.discordapp.com/attachments/980813644948463656/986291948430164028/mosesSpinHD.gif",
                        url: `https://discord.com/channels/${guild.id}/980813191556780064`,
                    });
                    sendDailyQuote();
                })
                .catch(() => {
                    console.error(err);

                    embed.setTitle(`An error occurred while processing your request.`);
                    embed.setColor("#ff0000");
                })
                .finally(() => {
                    if (interaction) {
                        interaction.reply({
                            embeds: [embed],
                            ephemeral: true,
                        });
                    }
                });
            return;
        }

        embed.setAuthor({
            name: "Re-rolled today's quote",
            iconURL: "https://cdn.discordapp.com/attachments/980813644948463656/986291948430164028/mosesSpinHD.gif",
            url: `https://discord.com/channels/${guild.id}/980813191556780064`,
        });

        sendDailyQuote();

        if (interaction) {
            interaction.reply({
                embeds: [embed],
                ephemeral: true,
            });
        }
    },
};
