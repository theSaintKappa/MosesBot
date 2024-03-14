import { ChannelType, type InteractionReplyOptions, PermissionFlagsBits, type PermissionOverwrites, SlashCommandBuilder } from "discord.js";
import { getNoticeReply } from "../../utils/replyEmbeds";
import { CommandScope, type SlashCommandObject } from "../types";

export default {
    builder: new SlashCommandBuilder()
        .setName("channel")
        .setDescription("Channel managment related commands.")
        .addSubcommand((subcommand) => subcommand.setName("hide").setDescription("Hide a channel"))
        .addSubcommand((subcommand) => subcommand.setName("unhide").setDescription("Unhide a channel"))
        .addSubcommand((subcommand) => subcommand.setName("lock").setDescription("Lock a channel"))
        .addSubcommand((subcommand) => subcommand.setName("unlock").setDescription("Unlock a channel")),

    scope: CommandScope.Global,

    run: async (interaction) => {
        const { options } = interaction;
        const subcommand = options.getSubcommand();
        const channel = interaction.channel;

        if (channel?.type !== ChannelType.GuildText) return interaction.reply(getNoticeReply("This command can only be used in text channels.", true));

        const permission = channel.permissionOverwrites.cache.get(channel.guild.roles.everyone.id);
        if (!permission) throw new Error("Permission overwrite for @everyone not found.");

        switch (subcommand) {
            case "hide":
                await interaction.reply(setVisibility(permission, false));
                break;
            case "unhide":
                await interaction.reply(setVisibility(permission, true));
                break;
            case "lock":
                interaction.reply(setLockedState(permission, true));
                break;
            case "unlock":
                interaction.reply(setLockedState(permission, false));
                break;
        }
    },
} as SlashCommandObject;

function setVisibility(permission: PermissionOverwrites, setVisible: boolean): InteractionReplyOptions {
    const isHidden = permission.deny.has(PermissionFlagsBits.ViewChannel);

    if (setVisible) {
        if (!isHidden) return { content: "> This channel is already visible." };
        permission.edit({ ViewChannel: null });
        return { content: "> 👁️ This channel is now visible." };
    }

    if (isHidden) return { content: "> This channel is already hidden." };
    permission.edit({ ViewChannel: false });
    return { content: "> 🫥 This channel is now hidden." };
}

function setLockedState(permission: PermissionOverwrites, setLocked: boolean): InteractionReplyOptions {
    const isLocked = permission.deny.has(PermissionFlagsBits.SendMessages);

    if (setLocked) {
        if (isLocked) return { content: "> This channel is already locked." };
        permission.edit({ SendMessages: false });
        return { content: "> 🔒 This channel is now locked." };
    }

    if (!isLocked) return { content: "> This channel is already unlocked." };
    permission.edit({ SendMessages: null });
    return { content: "> 🔓 This channel is now unlocked." };
}
