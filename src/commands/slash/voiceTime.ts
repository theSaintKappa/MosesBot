import { CommandScope, type SlashCommandObject } from "@/commands/types";
import { getLeaderboardEmbed, getStateEmbed } from "@/features/voiceTime";
import VoiceTime from "@/models/bot/voiceTime";
import { SlashCommandBuilder } from "discord.js";

export default {
    builder: new SlashCommandBuilder()
        .setName("vt")
        .setDescription("Voice channel time tracking related commands.")
        .addSubcommand((subcommand) => subcommand.setName("leaderboard").setDescription("Display the voice time leaderboard for all server members."))
        .addSubcommand((subcommand) => subcommand.setName("state").setDescription("Display the voice time state for all members currently in a voice channel.")),

    scope: CommandScope.Guild,

    run: async (interaction) => {
        const { options } = interaction;
        const subcommand = options.getSubcommand() as "leaderboard" | "state";

        switch (subcommand) {
            case "leaderboard": {
                const voiceTime = await VoiceTime.find({}).sort({ time: -1 });
                await interaction.reply({ embeds: [getLeaderboardEmbed(voiceTime)] });
                break;
            }
            case "state": {
                await interaction.reply({ embeds: [getStateEmbed()] });
                break;
            }
        }
    },
} as SlashCommandObject;
