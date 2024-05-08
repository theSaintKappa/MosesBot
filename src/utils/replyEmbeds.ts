import { type ColorResolvable, EmbedBuilder, type InteractionReplyOptions, type MessageCreateOptions } from "discord.js";

const replyTypes: { [key in "info" | "success" | "error" | "notice" | "loading"]: { color: ColorResolvable; icon: string } } = {
    info: { color: "#00c8ff", icon: "💛" },
    success: { color: "#00ff3c", icon: "✅" },
    error: { color: "#ff2600", icon: "❌" },
    notice: { color: "#ffdd00", icon: "⚠️" },
    loading: { color: "#ff4778", icon: "<a:loadingDots:1236762733307891783>" },
};

export const getInfoReply = (title: string, description: string): InteractionReplyOptions => ({ embeds: [new EmbedBuilder().setColor("#00c8ff").setTitle(`> 💛 ${title}`).setDescription(description)] });
export const getSuccessReply = (title: string, description: string): InteractionReplyOptions => ({ embeds: [new EmbedBuilder().setColor("#00ff3c").setTitle(`> ✅ ${title}`).setDescription(description)] });
export const getErrorReply = (error: string, ephemeral = true): InteractionReplyOptions => ({ embeds: [new EmbedBuilder().setColor("#ff2600").setDescription(`> ❌ ${error}`)], ephemeral });
export const getNoticeReply = (title: string, ephemeral = false): InteractionReplyOptions => ({ embeds: [new EmbedBuilder().setColor("#ffdd00").setTitle(`> ⚠️ ${title}`)], ephemeral });

export const messageReply = (type: keyof typeof replyTypes, title?: string | null, description?: string | null) => {
    const embed = new EmbedBuilder().setColor(replyTypes[type].color);
    if (title) embed.setTitle(`> ${!description || (title && description) ? `${replyTypes[type].icon} ` : ""}${title}`);
    if (description) embed.setDescription(`> ${!title ? `${replyTypes[type].icon} ` : ""}${description}`);
    return { embeds: [embed] };
};
