import { SlashCommandBuilder } from "discord.js";
import { CommandObject } from "../commands";

export default {
    builder: new SlashCommandBuilder().setName("ping").setDescription("Replies with Pong!"),
    run: async (interaction) => {
        await interaction.reply("Pong!");
    },
} as CommandObject;
