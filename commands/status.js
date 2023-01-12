const { ApplicationCommandOptionType } = require("discord.js");
const { CommandType } = require("wokcommands");
module.exports = {
    description: "Change the bot presence.",
    type: CommandType.SLASH,
    testOnly: true,
    options: [
        {
            name: "type",
            description: "Choose an activity type.",
            required: true,
            type: ApplicationCommandOptionType.String,
            choices: [
                {
                    name: "Playing",
                    value: "0",
                },
                {
                    name: "Streaming",
                    value: "1",
                },
                {
                    name: "Listening to",
                    value: "2",
                },
                {
                    name: "Watching",
                    value: "3",
                },
                {
                    name: "Competing in",
                    value: "5",
                },
            ],
        },
        {
            name: "status",
            description: "Provide the actual ststus.",
            required: true,
            type: ApplicationCommandOptionType.String,
        },
    ],

    callback: ({ client, interaction, args }) => {
        const type = parseInt(args[0]);
        const activity = args[1];

        const activities = {
            0: "Playing",
            1: "Streaming",
            2: "Listening to",
            3: "Watching",
            5: "Competing in",
        };

        client.user.setActivity({ type, url: "https://www.twitch.tv/itsgino_", name: activity });

        if (interaction) {
            interaction.reply({
                content: `> Client presence set to "**${activities[type]} ${activity}**"`,
            });
        }
    },
};
