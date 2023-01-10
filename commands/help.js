const { EmbedBuilder } = require("discord.js");

module.exports = {
    category: "MosesUtilities",
    description: "List all the available Moses bot commands",

    slash: true,
    testOnly: true,

    callback: async ({ interaction, client }) => {
        const owo = await client.users.cache.get("315531146953752578");

        const embed = new EmbedBuilder()
            .setTitle("MosesBot command help:")
            .setColor("Random")
            .setThumbnail("https://cdn.discordapp.com/attachments/980813644948463656/982458232306032700/3.jpg?size=4096")
            // .setDescription("\u200B")
            .addFields(
                { name: "\u200B", value: "╒══════ ***Moses quotes commands*** ══════╕", inline: false },
                { name: "/moses <add, edit, remove, list, leaderboard>", value: "Add, edit, remove a Moses quote, list all the ones stored or view the leaderboard", inline: false },
                { name: "╘═════════════════════════════╛", value: "\u200B", inline: false },

                { name: "\u200B", value: "╒═══════ ***2pT quotes commands*** ═══════╕", inline: false },
                { name: "/2pT <add, edit, remove, list>", value: "Add, edit, remove a 2pT quote or list all the ones stored", inline: false },
                { name: "╘═════════════════════════════╛", value: "\u200B", inline: false },

                { name: "\u200B", value: "╒══════ ***Moses utilities commands*** ══════╕", inline: false },
                { name: "/help", value: "Displays this list", inline: true },
                { name: "/goodnight", value: "Wish everyone a good night sleep", inline: true },
                { name: "/programming [language]", value: "Anime Girls Holding Programming Books. If language is not provided a random one will be selected (case insensitive)", inline: false },
                { name: "/waifu <sfw/nsfw>", value: "I apologize", inline: false },

                { name: "\u200B", value: "***Admin commands:***", inline: false },
                { name: "/reroll <clear previous?>", value: "Re-roll today's daily quote", inline: true },
                { name: "/status", value: "Change the bot status", inline: true },
                { name: "/clear", value: "Purge messages from the current channel", inline: true },
                { name: "/say <message>", value: "Make the bot say whatever you want", inline: true },
                { name: "/pingspam <start/stop> <user>", value: "Torture someone via discord mentions", inline: true },
                { name: "╘═════════════════════════════╛", value: "\u200B", inline: false }
            )
            .setFooter({ text: `Bot made with 💀 by ${owo.username}#${owo.discriminator}`, iconURL: `https://cdn.discordapp.com/avatars/${owo.id}/${owo.avatar}` });

        if (interaction) {
            interaction.reply({
                embeds: [embed],
                ephemeral: true,
            });
        }
    },
};
