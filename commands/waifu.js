const { EmbedBuilder } = require("discord.js");
const axios = require("axios");

module.exports = {
    category: "MentalBreakdown",
    description: ":3",

    options: [
        {
            type: 1,
            name: "sfw",
            description: "When moms home",
        },
        {
            type: 1,
            name: "nsfw",
            description: "When moms NOT home",
        },
    ],

    slash: true,
    testOnly: true,

    callback: async ({ interaction, channel, user }) => {
        let subcommand = `${interaction.options._subcommand.toString()}`;
        let content, ephemeral;
        switch (subcommand) {
            case "sfw":
                subcommand = "false";
                ephemeral = false;
                break;
            case "nsfw":
                subcommand = "true";
                content = "|| https://moses.gq ||";
                ephemeral = true;
                break;
        }

        await axios
            .get(`https://api.waifu.im/random?is_nsfw=${subcommand}`)
            .then(async (response) => {
                const res = response.data.images[0];

                let tags = [];
                for (const tag of res.tags) {
                    tags.push(tag.name);
                }

                const waifuEmbed = new EmbedBuilder()
                    .setColor(res.dominant_color)
                    .setAuthor({ name: "SaintKappa Waifu Viewer", iconURL: `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=4096` })
                    .addFields({ name: "Original source:", value: res.source, inline: true }, { name: "Dimensions:", value: `${res.width}x${res.height}`, inline: true }, { name: "Tags:", value: tags.join(", "), inline: true })
                    .setImage(res.url);

                if (res.is_nsfw) waifuEmbed.setAuthor({ name: "NSFW SaintKappa Waifu Viewer", iconURL: `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=4096` });

                if (interaction) {
                    interaction.reply({
                        content,
                        embeds: [waifuEmbed],
                        ephemeral,
                    });
                }
            })
            .catch((error) => {
                console.error(error);
                if (interaction) {
                    interaction.reply({
                        content: `An error occurred while fetching data. Please try again later or contact an server admin.\n\`${error.response.status} - ${error.response.statusText}\``,
                    });
                }
            });
    },
};
