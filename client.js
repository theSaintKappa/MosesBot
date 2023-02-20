const { Client, IntentsBitField, Partials, Events } = require('discord.js');
const WOK = require('wokcommands');
const mongoose = require('mongoose');
const statusSchema = require('./models/client-status-schema');
const picsWitelist = require('./pics-whitelist');
const path = require('path');
require('dotenv').config();

mongoose.set('strictQuery', true);

const client = new Client({
    intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.MessageContent,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.GuildMessageReactions,
        IntentsBitField.Flags.GuildPresences,
        IntentsBitField.Flags.GuildMembers,
        IntentsBitField.Flags.DirectMessages,
    ],
    partials: [Partials.Channel],
});

client.on(Events.ClientReady, async () => {
    console.log(`${client.user.username} is now up and running!`);

    new WOK({
        client,
        mongoUri: process.env.MONGO_URI,
        testServers: ['980813190780841984'],
        botOwners: ['315531146953752578', '304961013202288651'],
        commandsDir: path.join(__dirname, 'commands'),
        featuresDir: path.join(__dirname, 'cron'),
        events: { dir: path.join(__dirname, 'events') },
    });

    picsWitelist.fetch();

    // cron.schedule(
    //     '15 7 * * *', // Everyday at 7:15
    //     async () => {
    //         sendQuote(client);

    //         const moses = [...'Moses'].sort(() => 0.5 - Math.random());
    //         client.guilds.cache.get('980813190780841984').members.cache.get('389021335285661707').setNickname(moses.join(''));

    //         try {
    //             const request = await axios.get(`https://api.saintkappa.xyz/vulcan/luckyNumber`);

    //             client.channels.cache.get('1067438722703953992').setName(`🍀🔢 ›› ${request.data.number ?? 'brak'}`);
    //         } catch (err) {
    //             console.error(err);
    //         }
    //     },
    //     { timezone: 'Europe/Warsaw' }
    // );

    const clientStatus = await statusSchema.findOne({}).limit(1);
    client.user?.setPresence({ activities: [{ name: clientStatus.name, type: clientStatus.activityType, url: 'https://www.twitch.tv/itsgino_' }], status: clientStatus.status });
    console.log(`Client presence set to: ${clientStatus.activityName} ${clientStatus.name} (${clientStatus.status})`);
});

client.login(process.env.CLIENT_TOKEN);
