const { ApplicationCommandOptionType } = require('discord.js');
const statusSchema = require('../models/client-status-schema');
const { CommandType } = require('wokcommands');
module.exports = {
    description: 'Change the bot presence.',
    type: CommandType.SLASH,
    testOnly: true,
    options: [
        {
            name: 'type',
            description: 'Choose an activity type',
            required: true,
            type: ApplicationCommandOptionType.String,
            choices: [
                {
                    name: 'Playing',
                    value: '0',
                },
                {
                    name: 'Streaming',
                    value: '1',
                },
                {
                    name: 'Listening to',
                    value: '2',
                },
                {
                    name: 'Watching',
                    value: '3',
                },
                {
                    name: 'Competing in',
                    value: '5',
                },
            ],
        },
        {
            name: 'name',
            description: 'Provide the activity name',
            required: true,
            type: ApplicationCommandOptionType.String,
        },
        {
            name: 'status',
            description: 'Provide a ststus (optional)',
            required: false,
            type: ApplicationCommandOptionType.String,
            choices: [
                {
                    name: 'online',
                    value: 'online',
                },
                {
                    name: 'idle',
                    value: 'idle',
                },
                {
                    name: 'dnd',
                    value: 'dnd',
                },
            ],
        },
    ],

    callback: async ({ client, args }) => {
        const activities = {
            0: 'Playing',
            1: 'Streaming',
            2: 'Listening',
            3: 'Watching',
            5: 'Competing in',
        };
        const name = args[1];
        const activityType = parseInt(args[0]);
        const activityName = activities[parseInt(args[0])];
        const status = args[2] ?? 'online';

        try {
            client.user?.setPresence({ activities: [{ name, type: activityType, url: 'https://www.twitch.tv/itsgino_' }], status });

            await statusSchema.updateOne({}, { name, activityType, activityName, status, updatedAt: new Date().getTime() }, { upsert: true });
        } catch (err) {
            console.error(err);

            return { content: `An error occurred while setting the client presence.`, ephemeral: true };
        }

        return { content: `> Client presence set to "**${activityName} ${name}** (${status})"`, ephemeral: true };
    },
};
