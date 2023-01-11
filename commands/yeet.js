const { REST, Routes } = require("discord.js");
const { CommandType } = require("wokcommands");
require("dotenv").config();

const rest = new REST({ version: "10" }).setToken(process.env.CLIENT_TOKEN);

module.exports = {
    description: "!DANGEROUS! Yeets all guild and global slash commands from MosesBot !DANGEROUS!",
    type: CommandType.SLASH,
    testOnly: true,

    callback: async ({ client, guild }) => {
        let content;
        try {
            // for guild-based commands
            rest.put(Routes.applicationGuildCommands(client.user.id, guild.id), { body: [] });
            // for global commands
            rest.put(Routes.applicationCommands(client.user.id), { body: [] });

            content = ":white_check_mark: Succesfully YEETED all slash commands from global & guild scopes.";
        } catch (err) {
            console.error(err);
            content = ":interrobang: There was an error while trying to YEET all commands.";
        }

        return { content };
    },
};
