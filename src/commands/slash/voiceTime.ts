import { SlashCommandBuilder } from "discord.js";
import { getInfoReply } from "../../utils/replyEmbeds";
import { getVoiceTimeState } from "../../voiceTracker";
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
                await interaction.reply(viewLeaderboard());
                break;
            case "state":
                await interaction.reply(viewState());
                break;
        }
    },
} as SlashCommandObject;

const viewLeaderboard = () => ({ content: "> This functionality is not yet implemented. Check back later!", ephemeral: true });

const viewState = () =>
    getInfoReply(
        "Current VoiceTime state:",
        getVoiceTimeState().size
            ? [...getVoiceTimeState()].map(([userId, joinTime]) => `<@${userId}> **→** <t:${Math.floor(joinTime / 1000)}:R>`).join("\n")
            : "**No server members are currently in a voice channel.**"
    );
