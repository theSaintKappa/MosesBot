const { EmbedBuilder, MessageType } = require('discord.js');
const picsSchema = require('../../models/moses-pics-schema');
const picsWitelist = require('../../pics-whitelist');

module.exports = async (message, instance) => {
    const embed = new EmbedBuilder();
    // check if message is a dm, if it has any attachments, if it's of type default and if it's not sent by a bot (to prevent infinite loops)
    if (message.guildId || message.attachments.size === 0 || !message.type === MessageType.Default || message.author.bot) return;

    if (!picsWitelist.get().includes(message.author.id)) return message.reply({ embeds: [embed.setTitle('You are not whitelisted to upload Moses pics!\n> Ask a server admin to whitelist you.').setColor('#ff0000')] });

    const attachmentFileTypes = Array.from(message.attachments.values()).map((attachment) => attachment.contentType);
    if (!['image/jpeg', 'image/png', 'image/gif', 'image/webp'].some((fileType) => attachmentFileTypes.includes(fileType)))
        return message.reply({ embeds: [embed.setTitle('Only allowed file formats are: PNG, JPG, GIF & WEBP').setColor('#ff0000')] });

    const pics = Array.from(message.attachments.values()).map((attachment) => ({
        url: attachment.url,
        uploader: {
            id: message.author.id,
            username: message.author.username,
        },
        size: attachment.size,
        dimensions: {
            width: attachment.width,
            height: attachment.height,
        },
        contentType: attachment.contentType,
        name: attachment.name,
        id: attachment.id,
    }));

    await picsSchema.insertMany(pics);

    message.reply({ embeds: [embed.setTitle(`Succesfully uploaded ${message.attachments.size} file${message.attachments.size > 1 ? 's' : ''}!`).setColor('#00ff00')] });

    instance._client.channels.cache.get('1058118420186542120').send({
        content: `> <@${message.author.id}> just uploaded ${message.attachments.size} Moses pic${message.attachments.size > 1 ? 's' : ''}.\n> \`${pics.map((file) => file.id).join('`\n> `')}\``,
        files: pics.map((file) => file.url),
        allowedMentions: { users: [] },
    });
};
