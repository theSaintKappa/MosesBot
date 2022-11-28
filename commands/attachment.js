module.exports = {
    category: "MosesUtilities",
    description: "Attachments test.",

    options: [
        {
            name: "attachment",
            description: "attachment",
            type: 11, // attachment
            required: true,
        },
    ],

    slash: true,
    testOnly: true,

    callback: async ({ interaction, args }) => {
        const file = interaction.options._hoistedOptions[0].attachment;

        if (interaction) {
            interaction.reply({
                content: `\`\`\`yaml\nfileName: ${file.url}\nfileSize: ${parseFloat(file.size / 1000000).toFixed(3)}MB\nfileDimensions: ${file.width} x ${file.height}\ncontentType: "${file.contentType}"\n\`\`\``,
                ephemeral: false,
            });
        }
    },
};
