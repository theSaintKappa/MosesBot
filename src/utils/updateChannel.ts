import type { ChatInputCommandInteraction, GuildBasedChannel } from "discord.js";
import quoteSchema from "../models/moses/quote.schema";
import * as ptQuoteSchema from "../models/pt/quote.schema";

export async function updateMosesChannel(interaction: ChatInputCommandInteraction | undefined) {
    if (!interaction || !interaction.guild) return;
    interaction.guild.channels.cache.get("990343138268819497")?.edit({ name: `🛐 Moses Quotes ›› ${(await quoteSchema.find().sort({ id: -1 }).limit(1))[0]?.id || "1"}` });
    return;
}

export async function updatePtChannel(interaction: ChatInputCommandInteraction | undefined) {
    if (!interaction || !interaction.guild) return;
    interaction.guild.channels.cache.get("1029373422779781190")?.edit({ name: `🚼 3pT Quotes ›› ${(await ptQuoteSchema.default.find().sort({ id: -1 }).limit(1))[0]?.id || "1"}` });
    return;
}
