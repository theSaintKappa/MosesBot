const DiscordJS = require('discord.js');
const WOKCommands = require('wokcommands');
const path = require('path');
require('dotenv').config();
// const quotesSchema = require('./quotes-schema')

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
    const dbOptions = {
        keepAlive: true,
        useNewUrlParser: true,
        useUnifiedTopology: true,
    };

    const wok = new WOKCommands(client, {
        commandsDir: path.join(__dirname, 'commands'),
        testServers: ['980813190780841984'],
        botOwners: ['315531146953752578'],
        mongoUri: process.env.MONGO_URI,
        dbOptions,
    });
    wok.on('databaseConnected', async(connection, state) => {
        console.log(`The connection state is "${state}"`);
    });
});
module.exports = client

client.login(process.env.CLIENT_TOKEN);