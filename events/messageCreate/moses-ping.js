module.exports = (message, instance) => {
    if (message.content !== 'moses' || message.author.bot) return;
    try {
        message.channel.send('pong!').then((msg) => {
            msg.edit(`\`\`\`yaml\nClient latency: ${msg.createdTimestamp - message.createdTimestamp}ms\nWebSocket latency: ${instance._client.ws.ping}ms\`\`\``);
            message.delete();
        });
    } catch (err) {
        console.log(err);
    }
};
