import config from "@/config.json";
import { bucket } from "@/gcs";
import type { IMosesPic } from "@/models/MosesPic";
import { MosesPic } from "@/models/MosesPic";
import type { SendableChannel } from "@/types";
import secrets from "@/utils/secrets";
import type { GuildMember, Message } from "discord.js";
import { customAlphabet } from "nanoid";

const mimeTypes: Readonly<string[]> = ["image/png", "image/jpeg", "image/gif", "image/webp"];

const nanoid = customAlphabet("0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz", 8);

type Image = Pick<IMosesPic, "id" | "url" | "submitterId" | "size" | "dimensions" | "contentType">;

// TODO: Seperate logger util function
export async function uploadPics(uploadRequest: Message, logsChannel: SendableChannel, guildMember?: GuildMember) {
    if (!guildMember) {
        uploadRequest.reply("> *Thou must be a member of **The Moses Cult** to be able to upload **Moses Pics:tm:***");
        return;
    }

    if (!guildMember.roles.cache.has(config.roles.pt)) {
        const role = guildMember.guild.roles.cache.get(config.roles.pt);
        uploadRequest.reply(`> *Thou must be in possession of the **${role?.name ?? "pt"}** role to be able to upload **Moses Pics:tm:***`);
        return;
    }

    const attachments = uploadRequest.attachments.toJSON();

    if (attachments.some(({ contentType }) => !mimeTypes.includes(contentType as string))) {
        uploadRequest.react("❌");
        uploadRequest.reply(`> Only images are allowed to be uploaded (${mimeTypes.map((type) => type.split("/")[1]).join(", ")})`);
        return;
    }

    const loadingReaction = uploadRequest.react(uploadRequest.client.emojis.cache.get(config.emojis.loading) ?? "⏳");

    let uploadedImages: Image[];
    try {
        uploadedImages = await Promise.all(
            attachments.map(async (attachment) => {
                const buffer = await fetch(attachment.url).then((res) => res.arrayBuffer());

                const id = nanoid();

                await bucket.file(`moses/${id}`).save(Buffer.from(buffer), { metadata: { contentType: attachment.contentType as string, metadata: { uploaderId: uploadRequest.author.id } } });

                const url = `https://${secrets.gcp.bucket_name}/moses/${id}`;

                return { id, url, submitterId: uploadRequest.author.id, size: attachment.size, dimensions: { width: attachment.width ?? 0, height: attachment.height ?? 0 }, contentType: attachment.contentType as string };
            }),
        );
    } catch (err) {
        uploadRequest.react("❌");
        uploadRequest.reply("> An error occurred while processing your request.\n> Try again later or contact a server admin.");
        logsChannel.send({ content: `> <@${uploadRequest.author.id}> encountered an error while uploading images\n${err}`, allowedMentions: { users: [] } });
        return;
    }

    await MosesPic.insertMany<Image>(uploadedImages);

    const urlsString = `**| ${uploadedImages.map(({ id, url }) => `[${id}](<${url}>)`).join(" | ")} |**`;
    uploadRequest.reply(`> Succesfully uploaded ${uploadedImages.length} image${uploadedImages.length !== 1 ? "s" : ""}!\n\n> ${urlsString}`);

    logsChannel.send({ content: `> <@${uploadRequest.author.id}> uploaded ${uploadedImages.length} new image${uploadedImages.length !== 1 ? "s" : ""}\n\n> ${urlsString}`, allowedMentions: { users: [] } });

    await (await loadingReaction).users.remove(uploadRequest.client.user.id);
    uploadRequest.react("✅");
}
