const DiscordJS = require('discord.js');
const WOKCommands = require('wokcommands');
const path = require('path');
require('dotenv').config();

const { Intents } = DiscordJS;

const client = new DiscordJS.Client({
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
        Intents.FLAGS.GUILD_PRESENCES,
    ],
})

client.on('ready', () => {
    new WOKCommands(client, {
        commandsDir: path.join(__dirname, 'commands'),
        testServers: ['980813190780841984'],
        botOwners: ['315531146953752578'],
    });
});

client.login(process.env.CLIENT_TOKEN);