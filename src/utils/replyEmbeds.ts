import { EmbedBuilder, InteractionReplyOptions } from "discord.js";

export const getInfoReply = (title: string, description: string): InteractionReplyOptions => ({
    embeds: [
        new EmbedBuilder()
            .setColor("#00c8ff")
            .setTitle("> 💛 " + title)
            .setDescription(description),
    ],
    ephemeral: false,
});
export const getSuccessReply = (title: string, description: string): InteractionReplyOptions => ({
    embeds: [
        new EmbedBuilder()
            .setColor("#00ff3c")
            .setTitle("> ✅ " + title)
            .setDescription(description),
    ],
    ephemeral: false,
});
export const getErrorReply = (error: string): InteractionReplyOptions => ({ embeds: [new EmbedBuilder().setColor("#ff0000").setDescription("> ❌ " + error)], ephemeral: true });
