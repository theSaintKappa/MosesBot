import { ChannelType, type CommandInteractionOptionResolver, PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import { getNoticeReply } from "../../utils/replyEmbeds";
import { CommandScope, type SlashCommandObject } from "../types";

export default {
    builder: new SlashCommandBuilder()
        .setName("clear")
        .setDescription("Clear messages from this channel (not older than 2 weeks).")
        .addNumberOption((option) => option.setName("qty").setDescription("Number of messages you would like to delete.").setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    scope: CommandScope.Global,

    run: async (interaction) => {
        const qty = interaction.options?.getNumber("qty");

        if (!qty || qty < 1 || qty > 100) return interaction.reply(getNoticeReply("You can only delete between 1 and 100 messages.", true));

        const channel = interaction.channel as SendableChannel;
        if (!channel) return;
        if (![ChannelType.GuildText, ChannelType.GuildAnnouncement].includes(channel.type)) return interaction.reply(getNoticeReply("This command can only be used in text channels.", true));

        await channel.bulkDelete(qty, true);

        interaction.reply({ content: `> 🧹 Deleted ${qty} message${qty === 1 ? "" : "s"}` });
        setTimeout(() => interaction.deleteReply(), 5000);
    },
} as SlashCommandObject;
