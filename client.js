const DiscordJS = require("discord.js");
const WOK = require("wokcommands");
const path = require("path");
require("dotenv").config();
const { Client, IntentsBitField, Partials, ActivityType, EmbedBuilder, Events } = DiscordJS;
const { scheduleCron } = require("./scheduled/cron-jobs");
const picsSchema = require("./schemas/moses-pics-schema");
const mongoose = require("mongoose");
// look into this later ok?
mongoose.set("strictQuery", true);

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

client.on(Events.ClientReady, () => {
    console.log(`${client.user.username} is now up and running!`);

    const dbOptions = {
        keepAlive: true,
        useNewUrlParser: true,
        useUnifiedTopology: true,
    };

    new WOK({
        client,
        commandsDir: path.join(__dirname, "commands"),
        testServers: ["980813190780841984"],
        botOwners: ["315531146953752578", "304961013202288651"],
        commandsDir: path.join(__dirname, "commands"),
        mongoUri: process.env.MONGO_URI,
        dbOptions,
    });

    scheduleCron();

    client.user.setActivity("/help", { type: ActivityType.Watching });

    client.on(Events.GuildMemberAdd, (member) => {
        const author = {
            name: member.guild.name,
            iconURL: `https://cdn.discordapp.com/icons/${member.guild.id}/${member.guild.icon}.gif?size=4096`,
            url: "https://discord.gg/cHs56zgFBy",
        };
        const pmWelcomeEmbed = new EmbedBuilder()
            .setColor("#ff3fec")
            .setAuthor(author)
            .setThumbnail("https://cdn.discordapp.com/attachments/980813644948463656/986291948430164028/mosesSpinHD.gif?size=4096")
            .setTitle(`> :wave: Greetings ${member.user.username}!`)
            .setDescription(
                "My name is **`MosesBot`** and I would like to welcome you to\n**The Moses** ~~Cult~~ ***Club of Mutual Adoration!*** Originally, the server started out as a joke, however with time it just grew an we decided to go with it.\n\n*Missing the* **context** *on why tf you got invited here and don't know what this is all about?*\n Very well then. Gino/Mojżesz/***Moses*** sometimes says some stupid shit, so some dumbass who clearly has too much free time decided to make a discord bot that would store all of Moses' stupid \"quotes\" in a database.\nEvery day at **7:15am** (CET) a random Moses Quote will be sent to the <#980813191556780064> channel. The daily quote message contains a ping. Don't like pings? You can toggle them in <#980839919972921374>.\n\u200B"
            );
        const welcomeEmbed = new EmbedBuilder()
            .setColor("Random")
            .setAuthor(author)
            .setDescription(`> :wave: <@${member.user.id}> **has just joined \`${member.guild.name}\`**!`)
            .setThumbnail(`https://cdn.discordapp.com/avatars/${member.user.id}/${member.user.avatar}.png?size=4096`)
            .addFields({ name: "\u200B", value: "**ONE OF US!**", inline: true }, { name: "\u200B", value: "**ONE OF US!**", inline: true }, { name: "\u200B", value: "**ONE OF US!**", inline: true });

        member.send({ embeds: [pmWelcomeEmbed] });
        client.channels.cache.get("986301246048722955").send({ embeds: [welcomeEmbed] });
    });

    client.on(Events.GuildMemberUpdate, (oldMember, newMember) => {
        if (oldMember.pending === newMember.pending) return;

        console.log(`${newMember.user.username} just accepted the server rules!`);
        newMember.roles.add("980814138869698641");
    });
});

const serverChannels = {
    quotes: "980813191556780064",
    memes: "986333955286511656",
};

client.on(Events.MessageCreate, async (message) => {
    if (message.channel.id === "1058118420186542120" && message.embeds[0]?.data.description?.charAt(0) === "+") {
        const [attachment] = message.attachments.values();
        const description = message.embeds[0].data.fields?.find((obj) => obj.name === "Description:").value;
        await new picsSchema({
            fileUrl: attachment.attachment,
            description: description !== "*none*" ? description : null,
            uploadDate: new Date().getTime(),
            uploader: {
                userName: message.author.username,
                userId: message.author.id,
            },
            fileSize: attachment.size, // in bytes
            fileDimensions: {
                width: attachment.width,
                height: attachment.height,
            },
            contentType: attachment.contentType,
            fileName: attachment.name,
        }).save();
        return;
    }

    if (Object.values(serverChannels).includes(message.channel.id)) {
        try {
            // if message in memes channel && if message has no attachments
            if (message.channel.id === serverChannels.memes && !message.attachments.size && !message.content.startsWith("https://cdn.discordapp.com/attachments/") && !message.content.startsWith("https://media.discordapp.net/attachments/"))
                return;

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
                m.edit(`moses indeed!\n\nClient latency: \`${m.createdTimestamp - message.createdTimestamp}\`**ms**.\nAPI latency: \`${client.ws.ping}\`**ms**`);
                m.react("<:mosesThonk:981867313806602241>");
            });
        } catch (err) {
            console.log(err);
        }
    }
});

client.login(process.env.CLIENT_TOKEN);
