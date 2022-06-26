const DiscordJS = require('discord.js');
const WOKCommands = require('wokcommands');
const path = require('path');
require('dotenv').config();

const { Intents, MessageEmbed } = DiscordJS;

const client = new DiscordJS.Client({
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
        Intents.FLAGS.GUILD_PRESENCES,
        Intents.FLAGS.GUILD_MEMBERS,
    ],
})

client.on('ready', async() => {
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


    client.user.setActivity('/help', { type: 'WATCHING' });
    // const activities = [
    //     '/help',
    //     `${client.guilds.cache.reduce((a, b) => a + b.memberCount, 0)} moses fans!`
    // ];
    // let i = 0;
    // setInterval(() => client.user.setActivity(`${activities[i++ % activities.length]}`, { type: 'WATCHING' }), 15000);



    const user = await client.users.fetch('650785575888093184');
    const pmEmbed = new MessageEmbed()
        .setColor('RANDOM')
        .setDescription('> ***Hey! <a:mosesSquishy:985964224377389056>***\nJust a friendly reminder to finish writing your fucking code.\n*Have a good one*!')
        .setFooter({ text: 'MosesReminders', iconURL: 'https://cdn.discordapp.com/avatars/315531146953752578/c74e42cfa5ab08a5daa5ede7365e2244.png?size=4096' })
        .setTimestamp();
    setInterval(() => {
        user.send({ embeds: [pmEmbed] });
        pmEmbed.setColor('RANDOM');
    }, 1800000);


    client.on('guildMemberAdd', (member) => {
        const author = { name: member.guild.name, iconURL: `https://cdn.discordapp.com/icons/${member.guild.id}/${member.guild.icon}.gif?size=4096`, url: 'https://moses.gq/' };
        const pmWelcomeEmbed = new MessageEmbed()
            .setColor('#ff3fec')
            .setAuthor(author)
            .setThumbnail('https://cdn.discordapp.com/attachments/980813644948463656/986291948430164028/mosesSpinHD.gif?size=4096')
            .setTitle(`> :wave: Greetings ${member.user.username}!`)
            .setDescription('My name is **\`MosesBot\`** and I would like to welcome you to\n**The Moses** ~~Cult~~ ***Club of Mutual Adoration!*** Originally, the server started out as a joke, however with time it just grew an we decided to go with it.\n\n*Missing the* **context** *on why tf you got invited here and don\'t know what this is all about?*\n Very well then. Gino/Mojżesz/***Moses*** sometimes says some stupid shit, so some dumbass who clearly has too much free time decided to make a discord bot that would store all of Moses\' stupid "quotes" in a database.\nEvery day at **8am** (CEST) a random Moses Quote will be sent to the <#980813191556780064> channel. The daily quote message contains a ping. Don\'t like pings? You can toggle them in <#980839919972921374>.\n\u200B')
            .setFooter({ text: 'Moses Before Hoes(es)!' });
        const welcomeEmbed = new MessageEmbed()
            .setColor('RANDOM')
            .setAuthor(author)
            .setDescription(`> :wave: <@${member.user.id}> **has just joined \`${member.guild.name}\`**!`)
            .setThumbnail(`https://cdn.discordapp.com/avatars/${member.user.id}/${member.user.avatar}.png?size=4096`)
            .addFields({ name: '\u200B', value: '**ONE OF US!**', inline: true }, { name: '\u200B', value: '**ONE OF US!**', inline: true }, { name: '\u200B', value: '**ONE OF US!**', inline: true });

        member.send({ embeds: [pmWelcomeEmbed] });
        client.channels.cache.get('986301246048722955').send({ embeds: [welcomeEmbed] });
    });

    client.on('guildMemberUpdate', (oldMember, newMember) => {
        if (oldMember.pending === newMember.pending) return;

        console.log(`${newMember.user.username} just accepted the server rules!`);
        newMember.roles.add('980814138869698641');
    });
});



const reactChannels = ['980813191556780064', '986333955286511656'];
client.on('messageCreate', async(message) => {
    if (reactChannels.includes(message.channel.id)) {
        try {
            await message.react('<:upvote:982630993997496321>');
            await message.react('<:downvote:982630978566639616>');
        } catch (err) {
            console.error(err);
        }
    }
    if (message.content === 'moses' && !message.author.bot) {

        const mosesReply = ['moses indeed', 'ey yo moses', 'moses where?', 'm0535'];
        const randomReply = Math.floor(Math.random() * mosesReply.length);

        try {
            message.channel.send('pong! and shit').then(m => {
                m.edit(`${mosesReply[randomReply]}\n\nClient latency: \`${m.createdTimestamp - message.createdTimestamp}\`**ms**.\nAPI latency: \`${Math.round(client.ws.ping)}\`**ms**`);
                m.react('<:mosesThonk:981867313806602241>');
            });
        } catch (err) {
            console.log(err);
        }
    }
});


client.login(process.env.CLIENT_TOKEN);