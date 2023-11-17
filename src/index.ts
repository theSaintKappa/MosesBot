import { ActivityType, Client, EmbedBuilder, Events, GatewayIntentBits, Message, Partials } from "discord.js";
import { executeCommand } from "./commands";
import "./db/setup";
import { IPresence } from "./db/types";
import Presence from "./models/bot/presence";
import { deletePics, uploadPics } from "./pics";
import scheduleJobs from "./scheduler";
import secrets from "./secrets";

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildPresences,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.DirectMessages,
    ],
    partials: [Partials.Channel],
});

client.once(Events.ClientReady, async (client) => {
    console.log(`⚙️  Running in ${secrets.environment} mode`);
    console.log(`🟢 ${client.user.username} is now online!`);

    scheduleJobs(client);

    const picLogsChannel = client.channels.cache.get("1058118420186542120") as SendableChannel;
    client.on(Events.MessageCreate, async (message) => {
        await uploadPics(message, picLogsChannel);
    });
    client.on(Events.MessageDelete, async (message) => {
        await deletePics(message, picLogsChannel);
    });

    client.on(Events.InteractionCreate, async (interaction) => {
        if (interaction.isChatInputCommand()) executeCommand(interaction);
    });

    client.on(Events.GuildMemberUpdate, async (oldMember, newMember) => {
        if (oldMember.pending !== newMember.pending) newMember.roles.add("980814138869698641");
    });

    client.on(Events.MessageCreate, async (message) => {
        if (message.content === "moses" && !message.author.bot) {
            message.channel.send("pong!").then((msg: Message) => {
                msg.edit(`\`\`\`yaml\nClient latency: ${msg.createdTimestamp - message.createdTimestamp}ms\nWebSocket latency: ${client.ws.ping}ms\`\`\``);
                message.delete();
            });
        }

        if (message.channel.id === "986333955286511656" && message.embeds.length !== 0 && message.attachments.size !== 0) {
            message.react("<:upvote:982630993997496321>");
            message.react("<:downvote:982630978566639616>");
        }
    });

    client.on(Events.GuildMemberAdd, async (member) => {
        const dmEmbed = new EmbedBuilder()
            .setColor("#ff3fec")
            .setAuthor({ name: member.guild.name, iconURL: `https://cdn.discordapp.com/icons/${member.guild.id}/${member.guild.icon}.gif`, url: "https://discord.gg/cHs56zgFBy" })
            .setThumbnail("https://cdn.discordapp.com/attachments/980813644948463656/986291948430164028/mosesSpinHD.gif")
            .setTitle(`> :wave: Greetings ${member.user.username}!`)
            .setDescription(
                "My name is **`MosesBot`** and I would like to welcome you to\n**The Moses** ~~Cult~~ ***Club of Mutual Adoration!*** Originally, the server started out as a joke, however with time it just grew an we decided to go with it.\n\n*Missing the* **context** *on why tf you got invited here and don't know what this is all about?*\n Very well then. Gino/Mojżesz/***Moses*** sometimes says some stupid shit, so some dumbass who clearly has too much free time decided to make a discord bot that would store all of Moses' stupid \"quotes\" in a database.\nEvery day at **7:15am** (CET) a random Moses Quote will be sent to the <#980813191556780064> channel. The daily quote message contains a ping. Don't like pings? You can toggle them in <#980839919972921374>.\n\u200B"
            );
        member.send({ embeds: [dmEmbed] });

        const welcomeEmbed = new EmbedBuilder()
            .setColor("Random")
            .setDescription(`> :wave: <@${member.user.id}> **has just joined \`${member.guild.name}\`**!`)
            .setThumbnail(`https://cdn.discordapp.com/avatars/${member.user.id}/${member.user.avatar}.png`)
            .addFields({ name: "\u200B", value: "**ONE OF US!**", inline: true }, { name: "\u200B", value: "**ONE OF US!**", inline: true }, { name: "\u200B", value: "**ONE OF US!**", inline: true });

        const welcomeChannel = client.channels.cache.get("986301246048722955") as SendableChannel;
        welcomeChannel.send({ embeds: [welcomeEmbed] });
    });

    if (secrets.environment === "production") {
        const presence = await Presence.findOne<IPresence>();
        if (presence) client.user.setPresence({ activities: [{ type: presence.type, name: presence.name }], status: presence.status });
        return;
    }
    client.user.setPresence({ activities: [{ type: ActivityType.Custom, name: "⚙️ TESTING MODE" }], status: "dnd" });
});

client.login(secrets.discordToken);
