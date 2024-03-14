import { EmbedBuilder, type InteractionReplyOptions } from "discord.js";

export const getInfoReply = (title: string, description: string): InteractionReplyOptions => ({
    embeds: [new EmbedBuilder().setColor("#00c8ff").setTitle(`> 💛 ${title}`).setDescription(description)],
    ephemeral: false,
});
export const getSuccessReply = (title: string, description: string): InteractionReplyOptions => ({
    embeds: [new EmbedBuilder().setColor("#00ff3c").setTitle(`> ✅ ${title}`).setDescription(description)],
    ephemeral: false,
});
export const getErrorReply = (error: string): InteractionReplyOptions => ({ embeds: [new EmbedBuilder().setColor("#ff2600").setDescription(`> ❌ ${error}`)], ephemeral: true });
export const getNoticeReply = (title: string, ephemeral?: boolean): InteractionReplyOptions => ({
    embeds: [new EmbedBuilder().setColor("#ffdd00").setTitle(`> ⚠️ ${title}`)],
    ephemeral: ephemeral ?? false,
});
