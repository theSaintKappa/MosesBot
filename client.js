const cron = require("node-cron");
const { sendDailyQuote } = require("./daily-quote");
const DiscordJS = require("discord.js");
const WOKCommands = require("wokcommands");
const path = require("path");
require("dotenv").config();
const { GatewayIntentBits, ActivityType, EmbedBuilder } = DiscordJS;

const client = new DiscordJS.Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildPresences,
        GatewayIntentBits.GuildMembers,
    ],
});

const weekdays = {
    0: "Sunday",
    1: "Monday",
    2: "Tuesday",
    3: "Wednesday",
    4: "Thursday",
    5: "Friday",
    6: "Saturday",
};

client.on("ready", async () => {
    const dbOptions = {
        keepAlive: true,
        useNewUrlParser: true,
        useUnifiedTopology: true,
    };

    const wok = new WOKCommands(client, {
        commandsDir: path.join(__dirname, "commands"),
        testServers: ["980813190780841984"],
        botOwners: ["315531146953752578", "304961013202288651"],
        mongoUri: process.env.MONGO_URI,
        dbOptions,
    });

    wok.on("databaseConnected", async (connection, state) => {
        console.log(`The MongoDB connection state is "${state}"`);

        cron.schedule(
            "15 7 * * *", // Everyday at 7:15
            () => {
                const date = new Date();
                console.log(`[Moses Daily Quotes] ${date.getHours()}:${("0" + date.getMinutes()).slice(-2)} sending ${weekdays[date.getDay()]} quote...`);
                sendDailyQuote();
            },
            { timezone: "Europe/Warsaw" }
        );
    });

    client.user.setActivity("/help", { type: ActivityType.Watching });

    client.on("guildMemberAdd", (member) => {
        const author = {
            name: member.guild.name,
            iconURL: `https://cdn.discordapp.com/icons/${member.guild.id}/${member.guild.icon}.gif?size=4096`,
            url: "https://moses.gq/",
        };
        const pmWelcomeEmbed = new EmbedBuilder()
            .setColor("#ff3fec")
            .setAuthor(author)
            .setThumbnail("https://cdn.discordapp.com/attachments/980813644948463656/986291948430164028/mosesSpinHD.gif?size=4096")
            .setTitle(`> :wave: Greetings ${member.user.username}!`)
            .setDescription(
                "My name is **`MosesBot`** and I would like to welcome you to\n**The Moses** ~~Cult~~ ***Club of Mutual Adoration!*** Originally, the server started out as a joke, however with time it just grew an we decided to go with it.\n\n*Missing the* **context** *on why tf you got invited here and don't know what this is all about?*\n Very well then. Gino/Mojżesz/***Moses*** sometimes says some stupid shit, so some dumbass who clearly has too much free time decided to make a discord bot that would store all of Moses' stupid \"quotes\" in a database.\nEvery day at **8am** (CEST) a random Moses Quote will be sent to the <#980813191556780064> channel. The daily quote message contains a ping. Don't like pings? You can toggle them in <#980839919972921374>.\n\u200B"
            )
            .setFooter({ text: "Moses Before Hoes(es)!" });
        const welcomeEmbed = new EmbedBuilder()
            .setColor("Random")
            .setAuthor(author)
            .setDescription(`> :wave: <@${member.user.id}> **has just joined \`${member.guild.name}\`**!`)
            .setThumbnail(`https://cdn.discordapp.com/avatars/${member.user.id}/${member.user.avatar}.png?size=4096`)
            .addFields(
                { name: "\u200B", value: "**ONE OF US!**", inline: true },
                { name: "\u200B", value: "**ONE OF US!**", inline: true },
                { name: "\u200B", value: "**ONE OF US!**", inline: true }
            );

        member.send({ embeds: [pmWelcomeEmbed] });
        client.channels.cache.get("986301246048722955").send({ embeds: [welcomeEmbed] });
    });

    client.on("guildMemberUpdate", (oldMember, newMember) => {
        if (oldMember.pending === newMember.pending) return;

        console.log(`${newMember.user.username} just accepted the server rules!`);
        newMember.roles.add("980814138869698641");
    });
});

const reactChannels = ["980813191556780064", "986333955286511656"];
// quotes, memes
client.on("messageCreate", async (message) => {
    if (reactChannels.includes(message.channel.id)) {
        try {
            // if message in memes channel && if message has no attachments
            if (message.channel.id === reactChannels[1] && !message.attachments.size) return;

            await message.react("<:upvote:982630993997496321>");
            await message.react("<:downvote:982630978566639616>");
        } catch (err) {
            console.error(err);
        }
        return;
    }

    if (message.content === "moses" && !message.author.bot) {
        try {
            message.channel.send("pong!").then((m) => {
                m.edit(
                    `moses indeed!\n\nClient latency: \`${m.createdTimestamp - message.createdTimestamp}\`**ms**.\nAPI latency: \`${client.ws.ping}\`**ms**`
                );
                m.react("<:mosesThonk:981867313806602241>");
            });
        } catch (err) {
            console.log(err);
        }
    }
});

client.login(process.env.CLIENT_TOKEN);
