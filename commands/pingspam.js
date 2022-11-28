let spam = require("../controllers/spam-controller");

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
                if (!spam.getStatus()) {
                    response = `> ${pingEmote} Started torturing <@${userId}>!`;
                } else {
                    response = `> ${pingEmote} Updated pingspam! Now torturing <@${userId}>!`;
                }

                spam.setReceiver(userId);
                spam.setChannel(channel);

                // Only set the optional msg if optional arg is defined
                if (optionalArg !== "undefined") {
                    spam.setMessage(` ${optionalArg}`);
                    spam.setStatus(true);
                    break;
                }
                spam.setMessage("");
                spam.setStatus(true);
                break;
            case "stop":
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

        if (interaction) {
            interaction.reply({
                content: response,
            });
        }
    },
};
