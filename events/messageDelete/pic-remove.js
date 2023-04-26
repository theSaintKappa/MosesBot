const { EmbedBuilder, MessageType } = require('discord.js');
const picsSchema = require('../../models/moses-pics-schema');
const embed = new EmbedBuilder();

module.exports = async (message, instance) => {
    // return if: message is not a pm, message has no attachments, message is not of type default, message is sent by a bot (to prevent infinite loops)
    if (message.guildId || message.attachments.size === 0 || !message.type === MessageType.Default || message.author.bot) return;

    const attachmentIds = [...message.attachments.keys()];

    const result = await picsSchema.deleteMany({ id: { $in: attachmentIds } });

    message.channel.send({ embeds: [embed.setTitle(`🗑️ Succesfully deleted ${result.deletedCount} pic${result.deletedCount > 1 ? 's' : ''}!`).setColor('#aaff29')] });

    instance._client.channels.cache.get('1058118420186542120').send({
        content: `> ➖ <@${message.author.id}> just **deleted** ${result.deletedCount} Moses pic${result.deletedCount > 1 ? 's' : ''}.\n> \`${attachmentIds.join('`\n> `')}\``,
        allowedMentions: { users: [] },
    });
};
