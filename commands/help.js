const { EmbedBuilder } = require("discord.js");

module.exports = {
    category: "MosesUtilities",
    description: "List all the available Moses commands",

    slash: true,
    testOnly: true,

    callback: async ({ interaction, client }) => {
        const owo = await client.users.cache.get("315531146953752578");

        const embed = new EmbedBuilder()
            .setTitle("MosesBot command help:")
            .setColor("Random")
            .setThumbnail("https://cdn.discordapp.com/attachments/980813644948463656/982458232306032700/3.jpg?size=4096")
            .setDescription("\u200B")
            .addFields(
                { name: "MosesDB related commands", value: "╒═══════════════════════╕", inline: false },
                { name: "/add", value: "Add a new quote to the MosesDB", inline: true },
                { name: "/edit", value: "Edit a quote in MosesDB", inline: true },
                { name: "/remove", value: "Remove a quote from MosesDB", inline: true },
                { name: "/quotes", value: "Displays all the currently stored Moses Quotes", inline: true },
                { name: "/leaderboard", value: "Displays the current leaderboard of Moses Enjoyers", inline: true },
                { name: "╘═══════════════════════╛", value: "\u200B", inline: false },

                { name: "2pT DB related commands", value: "╒═══════════════════════╕", inline: false },
                { name: "/2pT <add, edit, remove, list>", value: "Add, edit, remove a 2pT quote or list all the ones stored", inline: false },
                { name: "╘═══════════════════════╛", value: "\u200B", inline: false },

                { name: "MosesUtilities commands", value: "╒═══════════════════════╕", inline: false },
                { name: "/help", value: "Displays this list", inline: true },
                { name: "/goodnight", value: "Wish everyone a good night sleep", inline: true },
                { name: "/programming [language]", value: "Anime Girls Holding Programming Books. If [language] is not provided a random one will be selected (case insensitive)", inline: false },
                { name: "/waifu <sfw/nsfw>", value: "When moms not home :3 (had nothing to do with this)", inline: false },

                { name: "\u200B", value: "***Admin commands:***", inline: false },
                { name: "/reroll", value: "Re-roll today's daily quote", inline: true },
                { name: "/status", value: "Change the bot status", inline: true },
                { name: "/clear", value: "Purge messages from the current channel", inline: true },
                { name: "/pingspam <start/stop>", value: "Torture someone via discord mentions", inline: true },
                { name: "╘═══════════════════════╛", value: "\u200B", inline: false }
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
