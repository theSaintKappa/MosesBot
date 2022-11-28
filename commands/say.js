const { EmbedBuilder } = require("discord.js");

module.exports = {
    category: "MosesUtilities",
    description: "Sudo the bot to say something.",

    options: [
        {
            name: "message",
            description: "What words do you want to put in the bot's mouth?",
            type: 3, //string
            required: true,
        },
    ],

    slash: true,
    testOnly: true,

    callback: async ({ interaction, channel, user, text }) => {
        channel.send(text).then(() => {
            if (interaction) {
                interaction.reply({
                    content: `You made the bot say "\`${text}\`", congratulations.`,
                    ephemeral: true,
                });
            }
        });
    },
};
