const { ApplicationCommandOptionType } = require("discord.js");
const { CommandType } = require("wokcommands");

module.exports = {
    description: "Sudo the bot to say something.",
    type: CommandType.SLASH,
    testOnly: true,
    options: [
        {
            name: "message",
            description: "What words do you want to put in the bot's mouth?",
            type: ApplicationCommandOptionType.String,
            required: true,
        },
    ],

    callback: async ({ interaction, channel, user, text }) => {
        channel.send(text.replaceAll("\u005Cn", "\u000A")).then(() => {
            return {
                content: `You made the bot say "\`${text}\`", congratulations.`,
                ephemeral: true,
            };
        });
    },
};
