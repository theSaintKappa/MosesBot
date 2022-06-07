const { MessageEmbed } = require('discord.js');
let pingSpamActive = require('../dmq');

module.exports = {
    category: 'MosesUtilities',
    description: 'Wish everyone a good night sleep!',

    ownerOnly: true,

    options: [{
            name: 'action',
            description: 'Choose whether to start or stop pingspam',
            required: true,
            type: 'STRING',
            choices: [{
                    name: "Start",
                    value: "Start"
                },
                {
                    name: "Stop",
                    value: "Start"
                },
            ]

        },
        {
            name: 'user',
            description: 'Who do you want to torture today?',
            required: true,
            type: 'USER',
        },
        {
            name: 'optional-message',
            description: 'Optional message to go along with the ping',
            required: false,
            type: 'STRING',
        }
    ],

    slash: true,
    testOnly: true,

    callback: async({ interaction, channel, args }) => {

        // console.log(pingSpamActive);

        // if (args[0] === 'Start') {
        //     let contentReply = `<:mosesThonk:981867313806602241> Now torturing <@${args[1].toString()}>`;
        //     let contentSpam = `<@${args[1]}>`;

        //     if (args[2] !== undefined) {
        //         contentReply += ` with message: **\`${args[2]}\`**`;
        //         contentSpam += ` ${args[2]}`;
        //     }

        //     const embed = new MessageEmbed()
        //         .setDescription(contentReply)
        //         .setColor('RANDOM');


        //     if (interaction) {
        //         interaction.reply({
        //             embeds: [embed],
        //             ephemeral: true
        //         });
        //     }

        //     var interval = setInterval(async() => {
        //         const pingSpam = await channel.send({
        //             content: contentSpam
        //         });
        //         pingSpam.delete();
        //     }, 2000);
        // } else if (args[0] === 'Stop') {
        //     if (interaction) {
        //         interaction.reply({
        //             content: 'stopped',
        //             ephemeral: true
        //         });
        //     }

        //     clearInterval(interval);
        // }

        if (interaction) {
            interaction.reply({
                content: 'this command do be work in progress',
                ephemeral: true
            });
        }



    }
};