const { ApplicationCommandOptionType, PermissionFlagsBits } = require('discord.js');
const { CommandType } = require('wokcommands');
let spam = require('../spam-controller');

module.exports = {
    description: 'Wish everyone a good night sleep!',
    type: CommandType.SLASH,
    testOnly: true,
    guildOnly: true,
    permissions: [PermissionFlagsBits.Administrator],
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
                    name: 'optional-message',
                    description: 'Optional message to go along with the pings.',
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
        const subcommand = `${interaction.options._subcommand.toString()}`;
        const userId = `${interaction.options._hoistedOptions[0]?.value}`;
        const optionalArg = `${interaction.options._hoistedOptions[1]?.value}`;

        const pingEmote = '<:ping2:1021118765582254082>';

        let response;
        switch (subcommand) {
            case 'start':
                if (!spam.getStatus()) {
                    response = `> ${pingEmote} Started torturing <@${userId}>!`;
                } else {
                    response = `> ${pingEmote} Updated pingspam! Now torturing <@${userId}>!`;
                }

                spam.setReceiver(userId);
                spam.setChannel(channel);

                // Only set the optional msg if optional arg is defined
                if (optionalArg !== 'undefined') {
                    spam.setMessage(` ${optionalArg}`);
                    spam.setStatus(true);
                    break;
                }
                spam.setMessage('');
                spam.setStatus(true);
                break;
            case 'stop':
                if (!spam.getStatus()) {
                    response = `There is no active pingspam to stop!`;
                    break;
                }
                response = `> ${pingEmote} Stopped torturing <@${spam.getReceiver()}> with a streak of \`${spam.getCombo()}\`.`;

                spam.setStatus(false);

                spam.resetCombo();
                break;
            default:
                response = `Something went wrong!`;
        }

        return {
            content: response,
        };
    },
};
