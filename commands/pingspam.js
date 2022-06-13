const { MessageEmbed } = require('discord.js');
let pingSpamActive = require('../dmq');

module.exports = {
    category: 'MosesUtilities',
    description: 'Wish everyone a good night sleep!',

    ownerOnly: true,

    options: [{
            type: 1,
            name: "start",
            description: "Start torturing someone.",
            options: [{
                    type: 'USER',
                    name: "user",
                    description: "Who do you want to torture?",
                    required: true
                },
                {
                    type: 'STRING',
                    name: "optional-message",
                    description: "Optional message to go along with the pings.",
                    required: false
                }
            ]
        },
        {
            type: 1,
            name: "stop",
            description: "Stop torturing."
        }
    ],

    slash: true,
    testOnly: true,

    callback: async({ interaction }) => {

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

        console.log(`Subcommand: ${interaction.options._subcommand}`);
        console.log(`User: ${interaction.options._hoistedOptions[0].value}`);
        console.log(`Optional message: ${interaction.options._hoistedOptions[1]}`);

        if (interaction) {
            interaction.reply({
                content: `> Sorry! This command is not done yet.\n\n\`\`\`subcommandAction: ${interaction.options._subcommand}\nuserId: ${interaction.options._hoistedOptions[0].value}\noptionalArg: ${interaction.options._hoistedOptions[1]}\`\`\``,
                ephemeral: true
            });
        }



    }
};