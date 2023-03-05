const { ApplicationCommandOptionType, PermissionFlagsBits } = require('discord.js');
const { CommandType } = require('wokcommands');
let pingSpam = require('../ping-spam');

module.exports = {
    description: 'Torture someone via discord mentions.',
    type: CommandType.SLASH,
    testOnly: true,
    permissions: [PermissionFlagsBits.Administrator],
    guildOnly: true,

    options: [
        {
            type: ApplicationCommandOptionType.Subcommand,
            name: 'start',
            description: 'Start torturing someone.',
            options: [
                {
                    type: ApplicationCommandOptionType.User,
                    name: 'user',
                    description: 'Who do you want to torture?',
                    required: true,
                },
                {
                    type: ApplicationCommandOptionType.String,
                    name: 'message',
                    description: 'Message to go along with the pings (optional).',
                    required: false,
                },
            ],
        },
        {
            type: ApplicationCommandOptionType.Subcommand,
            name: 'stop',
            description: 'Stop torturing.',
        },
    ],

    callback: async ({ interaction, channel }) => {
        const subcommand = interaction.options._subcommand;
        const userId = interaction.options._hoistedOptions[0]?.value;
        const message = interaction.options._hoistedOptions[1]?.value ?? '';

        const pingEmote = '<:ping2:1021118765582254082>';

        switch (subcommand) {
            case 'start':
                if (pingSpam.getStatus()) {
                    pingSpam.setReceiver(userId);
                    pingSpam.setChannel(channel);
                    pingSpam.setMessage(message);
                    pingSpam.resetCombo();
                    return `> ${pingEmote} Updated pingspam! Now torturing <@${userId}>!`;
                }

                pingSpam.setReceiver(userId);
                pingSpam.setChannel(channel);
                pingSpam.setMessage(message);
                pingSpam.setStatus(true);

                return `> ${pingEmote} Started torturing <@${userId}>!`;

            case 'stop':
                if (!pingSpam.getStatus()) return { content: `There is no active pingspam to stop!`, ephemeral: true };

                pingSpam.setStatus(false);

                return `> ${pingEmote} Stopped torturing <@${pingSpam.getReceiver()}> with a streak of \`${pingSpam.getCombo()}\`.`;
        }
        pingSpam.resetCombo();
    },
};
