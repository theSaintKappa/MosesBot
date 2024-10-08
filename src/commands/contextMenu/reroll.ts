import { CommandScope, type ContextMenuCommandObject } from "@/commands/types";
import config from "@/config.json";
import { updateBotDescriptionQuote } from "@/features/botDescription";
import { getQuoteEmbed, getRandomPic, getRandomQuote, updateLastSentQuote } from "@/features/scheduler";
import type { SendableChannel } from "@/types";
import { ApplicationCommandType, ContextMenuCommandBuilder, PermissionFlagsBits } from "discord.js";

export default {
    builder: new ContextMenuCommandBuilder().setName("Reroll Moses quote").setType(ApplicationCommandType.Message).setDMPermission(false).setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    scope: CommandScope.Guild,

    run: async (interaction) => {
        if (interaction.channel && interaction.channel.id !== config.channels.quotes) interaction.reply({ content: `> ❌ This context menu command can only be used in the <#${config.channels.quotes}> channel.`, ephemeral: true });
        else {
            const channel = interaction.channel as SendableChannel;

            const quote = await getRandomQuote();
            const pic = await getRandomPic();

            channel.messages.cache.get(interaction.targetId)?.edit({ embeds: [getQuoteEmbed(quote, pic)] });
            interaction.reply({ content: "> ✅ Successfully rerolled the Moses quote.", ephemeral: true });

            updateLastSentQuote(quote);

            updateBotDescriptionQuote(interaction.client, quote);
        }

        setTimeout(() => interaction.deleteReply(), 5000);
    },
} as ContextMenuCommandObject;
