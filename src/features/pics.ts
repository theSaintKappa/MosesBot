import { type Message, MessageType, type PartialMessage } from "discord.js";
import MosesPic from "../models/moses/pics.schema";
import MosesPicUploader from "../models/moses/pics.uploaders.schema";

const uploadCheck = (message: Message | PartialMessage) => !message.guildId && message.attachments.size !== 0 && message.type === MessageType.Default && !message.author.bot;

export async function uploadPics(message: Message, logsChannel: SendableChannel) {
    if (!uploadCheck(message)) return;

    const picUploader = await MosesPicUploader.find({ userId: message.author.id });
    if (!picUploader) {
        message.reply({ content: "> ❌ You don't have permissions to upload Moses pics\n> Ask a server admin to add you to the list" });
        return;
    }

    const allowedFileTypes = ["image/png", "image/jpeg", "image/gif", "image/webp"];
    const uploadedFileTypes = [...message.attachments.values()].map((attachment) => attachment.contentType);
    if (!allowedFileTypes.some((fileType) => uploadedFileTypes.includes(fileType))) {
        message.reply({ content: "> ❌ Not allowed format type detected\n> Allowed file formats are: PNG, JPG, GIF & WEBP" });
        return;
    }

    const pics = await MosesPic.insertMany(message.attachments.toJSON().map(({ id, url, name, size, width, height, contentType }) => ({ id, url, submitterId: message.author.id, name, size, dimensions: { width, height }, contentType })));

    message.reply({ content: `> 🎉 Succesfully uploaded ${pics.length} Moses pic${pics.length !== 1 ? "s" : ""}!` });

    logsChannel.send({
        content: `> ➕ <@${message.author.id}> just **uploaded** ${pics.length} Moses pic${pics.length !== 1 ? "s" : ""}.\n> \`${pics.map((file) => file.id).join("`\n> `")}\``,
        files: pics.map((file) => file.url),
        allowedMentions: { users: [] },
    });
}

export async function deletePics(message: Message | PartialMessage, logsChannel: SendableChannel) {
    if (!uploadCheck(message)) return;

    const picIds = [...message.attachments.keys()];

    const pics = await MosesPic.deleteMany({ id: { $in: picIds } });

    message.channel.send({ content: `> 🗑️ Succesfully deleted ${pics.deletedCount} Moses pic${pics.deletedCount !== 1 ? "s" : ""}!` });

    logsChannel.send({
        content: `> ➖ <@${message.author?.id}> just **deleted** ${pics.deletedCount} Moses pic${pics.deletedCount !== 1 ? "s" : ""}.\n> \`${picIds.join("`\n> `")}\``,
        allowedMentions: { users: [] },
    });
}
