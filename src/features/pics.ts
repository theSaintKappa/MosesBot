import { Storage } from "@google-cloud/storage";
import type { Message, PartialMessage, Snowflake } from "discord.js";
import MosesPic from "../models/moses/pics.schema";
import { messageReply } from "../utils/replyEmbeds";
import secrets from "../utils/secrets";

const storage = new Storage({
    projectId: secrets.googleCredentials.project_id,
    credentials: secrets.googleCredentials,
});
const bucket = storage.bucket(secrets.googleCredentials.bucket_name);

const mimeTypes = ["image/png", "image/jpeg", "image/gif", "image/webp"] as const;
type AllowedMimeTypes = (typeof mimeTypes)[number];

// TODO: Seperate logger util function
export async function uploadPics(uploadRequest: Message, logsChannel: SendableChannel) {
    // const picUploader = await MosesPicUploader.find({ userId: message.author.id });
    // if (!picUploader) {
    //     message.reply({ content: "> ❌ You don't have permissions to upload Moses pics\n> Ask a server admin to add you to the list" });
    //     return;
    // }

    const attachments = uploadRequest.attachments.toJSON();

    if (attachments.some(({ contentType }) => !mimeTypes.includes(contentType as AllowedMimeTypes))) {
        uploadRequest.reply(messageReply("error", null, "Only image files are allowed to be uploaded *(png, jpg, webp or gif)*"));
        return;
    }

    const uploadMessage = uploadRequest.reply(messageReply("loading", null, `Uploading ${attachments.length} image${attachments.length !== 1 ? "s" : ""} \`${(attachments.reduce((acc, { size }) => acc + size, 0) / 1024 / 1024).toFixed(2)}MB\``));

    const uploadedImages: Image[] = [];

    interface Image {
        id: string;
        url: string;
        submitterId: Snowflake;
        name: string;
        size: number;
        dimensions: { width: number; height: number };
        contentType: AllowedMimeTypes;
    }

    for (const attachment of attachments) {
        try {
            const file = bucket.file(`moses/${attachment.id}`);

            const stream = file.createWriteStream({ metadata: { contentType: attachment.contentType as AllowedMimeTypes, metadata: { uploaderId: uploadRequest.author.id } } });

            const imageBuffer = await fetch(attachment.url).then((res) => res.arrayBuffer());

            stream.end(Buffer.from(imageBuffer));

            const url = `https://${secrets.googleCredentials.bucket_name}/moses/${attachment.id}`;

            uploadedImages.push({ id: attachment.id, url, submitterId: uploadRequest.author.id, name: attachment.name, size: attachment.size, dimensions: { width: attachment.width ?? 0, height: attachment.height ?? 0 }, contentType: attachment.contentType as AllowedMimeTypes });
        } catch (err) {
            (await uploadMessage).delete();
            uploadRequest.reply(messageReply("error", null, `Failed to upload image${attachments.length !== 1 ? "s" : ""}\nPlease try again later or contact a server admin`));
            return;
        }
    }

    (await uploadMessage).edit(messageReply("success", null, `Succesfully uploaded ${attachments.length} image${attachments.length !== 1 ? "s" : ""}!`));

    MosesPic.insertMany(uploadedImages);

    logsChannel.send({
        content: `> ➕ <@${uploadRequest.author.id}> just **uploaded** ${uploadedImages.length} Moses pic${uploadedImages.length !== 1 ? "s" : ""}\n${uploadedImages.map(({ url }) => url).join("\n")}`,
        allowedMentions: { users: [] },
    });
}

export async function deletePics(message: Message | PartialMessage, logsChannel: SendableChannel) {
    const picIds = [...message.attachments.keys()];

    const pics = await MosesPic.deleteMany({ id: { $in: picIds } });

    message.channel.send({ content: `> 🗑️ Succesfully deleted ${pics.deletedCount} Moses pic${pics.deletedCount !== 1 ? "s" : ""}!` });

    logsChannel.send({
        content: `> ➖ <@${message.author?.id}> just **deleted** ${pics.deletedCount} Moses pic${pics.deletedCount !== 1 ? "s" : ""}.\n> \`${picIds.join("`\n> `")}\``,
        allowedMentions: { users: [] },
    });
}
