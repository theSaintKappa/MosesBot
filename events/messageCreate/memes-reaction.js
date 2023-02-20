module.exports = async (message) => {
    if (message.channel.id !== '986333955286511656' || (message.embeds.length === 0 && message.attachments.size === 0)) return;

    try {
        await message.react('<:upvote:982630993997496321>');
        await message.react('<:downvote:982630978566639616>');
    } catch (err) {
        console.error(err);
    }
};
