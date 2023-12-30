import { ChannelType, CommandInteractionOptionResolver, PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import { CommandScope, SlashCommandObject } from "../../commands";

export default {
    builder: new SlashCommandBuilder()
        .setName("clear")
        .setDescription("Clear messages from this channel (not older than 2 weeks).")
        .addNumberOption((option) => option.setName("qty").setDescription("Number of messages you would like to delete.").setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    scope: CommandScope.Global,

    run: async (interaction) => {
        const qty = (<CommandInteractionOptionResolver>interaction.options).getNumber("qty")!!;

        if (qty < 1 || qty > 100) return interaction.reply({ content: "> ⚠️ You can only delete between 1 and 100 messages.", ephemeral: true });

        const channel = interaction.channel as SendableChannel;
        if (!channel) return;
        if (![ChannelType.GuildText, ChannelType.GuildAnnouncement].includes(channel.type))
            return interaction.reply({ content: "> ⚠️ This command can only be used in guild text channels.", ephemeral: true });

        await channel.bulkDelete(qty, true);

        interaction.reply({ content: `> 🧹 Deleted ${qty} message${qty === 1 ? "" : "s"}` });
        setTimeout(() => interaction.deleteReply(), 5000);
    },
} as SlashCommandObject;
