let spamCtrl = require("../controllers/spamCtrl");

module.exports = {
    category: "MosesUtilities",
    description: "Wish everyone a good night sleep!",

    ownerOnly: true,

    options: [
        {
            type: 1,
            name: "start",
            description: "Start torturing someone.",
            options: [
                {
                    type: 6,
                    name: "user",
                    description: "Who do you want to torture?",
                    required: true,
                },
                {
                    type: 3,
                    name: "optional-message",
                    description: "Optional message to go along with the pings.",
                    required: false,
                },
            ],
        },
        {
            type: 1,
            name: "stop",
            description: "Stop torturing.",
        },
    ],

    slash: true,
    testOnly: true,

    callback: async ({ interaction, channel }) => {
        const subcommand = `${interaction.options._subcommand.toString()}`;
        const userId = `${interaction.options._hoistedOptions[0]?.value}`;
        const optionalArg = `${interaction.options._hoistedOptions[1]?.value}`;

        const pingEmote = "<:ping2:1021118765582254082>";

        let response;
        switch (subcommand) {
            case "start":
                if (!spamCtrl.getStatus()) {
                    response = `> ${pingEmote} Started torturing <@${userId}>!`;
                } else {
                    response = `> ${pingEmote} Updated pingspam! Now torturing <@${userId}>!`;
                }

                spamCtrl.setReceiver(userId);
                spamCtrl.setChannel(channel);

                // Only set the optional msg if optional arg is defined
                if (optionalArg !== "undefined") {
                    spamCtrl.setMessage(` ${optionalArg}`);
                    spamCtrl.setStatus(true);
                    break;
                }
                spamCtrl.setMessage("");
                spamCtrl.setStatus(true);
                break;
            case "stop":
                if (!spamCtrl.getStatus()) {
                    response = `There is no active pingspam to stop!`;
                    break;
                }
                response = `> ${pingEmote} Stopped torturing <@${spamCtrl.getReceiver()}>.`;

                spamCtrl.setStatus(false);

                spamCtrl.resetCombo();
                break;
            default:
                response = `Something went wrong!`;
        }

        if (interaction) {
            interaction.reply({
                content: response,
            });
        }
    },
};
