import { CommandInteractionOptionResolver, PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import { CommandObject } from "./";

export default {
    builder: new SlashCommandBuilder()
        .setName("clear")
        .setDescription("Clear messages from this channel (not older than 2 weeks).")
        .addNumberOption((option) => option.setName("qty").setDescription("Number of messages you would like to delete.").setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    run: async (interaction) => {
        const channel = interaction.channel as SendableChannel;
        const qty = (<CommandInteractionOptionResolver>interaction.options).getNumber("qty")!!;

        if (qty < 1 || qty > 100) {
            interaction.reply({ content: "> ⚠️ You can only delete between 1 and 100 messages.", ephemeral: true });
            return;
        }

        await channel.bulkDelete(qty, true);

        interaction.reply({ content: `> 🧹 Deleted ${qty} message${qty === 1 ? "" : "s"}.` });
        setTimeout(() => interaction.deleteReply(), 5000);
    },
} as CommandObject;
