import { EmbedBuilder, SlashCommandBuilder } from "discord.js";
import { getStateEmbed } from "../../features/voiceTracker";
import VoiceTime from "../../models/bot/voiceTime";
import { getInfoReply } from "../../utils/replyEmbeds";
import { CommandScope, SlashCommandObject } from "../types";

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
            case "leaderboard":
                await interaction.reply(await viewLeaderboard());
                break;
            case "state":
                await interaction.reply({ embeds: [getStateEmbed()] });
                break;
        }
    },
} as SlashCommandObject;

async function viewLeaderboard() {
    const voiceTime = await VoiceTime.find({}).sort({ time: -1 });

    return getInfoReply("Voice Time Leaderboard", voiceTime.map((vt, i) => `**${i + 1}.** <@${vt.userId}> **→** ${(vt.time / 1000 / 60 / 60).toFixed(2)} hours`).join("\n"));
}
