// const { MessageEmbed } = require('discord.js');

module.exports = {
    category: 'MosesUtilities',
    description: 'Change the bot status',
    options: [{
            name: 'type',
            description: 'Choose activity type',
            required: true,
            type: 'STRING',
            choices: [{
                    name: "Playing",
                    value: "PLAYING"
                },
                {
                    name: "Watching",
                    value: "WATCHING"
                },
                {
                    name: "Streaming",
                    value: "STREAMING"
                },
                {
                    name: "Competing in",
                    value: "COMPETING"
                },
            ]

        },
        {
            name: 'status',
            description: 'Status',
            required: true,
            type: 'STRING',
        }
    ],
    slash: true,
    ownerOnly: true,
    testOnly: true,

    callback: ({ client, interaction, args }) => {
        const type = args[0].toString();
        const activity = args[1].toString();

        client.user.setActivity(activity, { type: type }); // STREAMING, WATCHING, CUSTOM_STATUS, PLAYING, COMPETING
        if (interaction) {
            interaction.reply({
                content: `> Activity set to \`${type} ${activity}\``
            });
        }
    }
};