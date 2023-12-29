import { ActivityType, AttachmentBuilder, Client, EmbedBuilder, Events, GatewayIntentBits, Message, Partials } from "discord.js";
import { autocomplete, executeCommand } from "./commands";
import config from "./config.json";
import "./db/setup";
import { IPresence } from "./db/types";
import Presence from "./models/bot/presence";
import VoiceTime from "./models/bot/voiceTime";
import { deletePics, uploadPics } from "./pics";
import { scheduleJobs } from "./scheduler";
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
        GatewayIntentBits.GuildVoiceStates,
    ],
    partials: [Partials.Channel],
});

client.once(Events.ClientReady, async (client) => {
    console.log(`⚙️  Running in ${secrets.environment} mode`);
    console.log(`🟢 ${client.user.username} is now online!`);

    // Schedule cron jobs
    scheduleJobs(client);

    // Execute commands
    client.on(Events.InteractionCreate, async (interaction) => {
        if (interaction.isChatInputCommand() || interaction.isContextMenuCommand()) return executeCommand(interaction);
        if (interaction.isAutocomplete()) return autocomplete(interaction);
    });

    // Upload and delete pics
    const picLogsChannel = client.channels.cache.get(config.channels.picsLog) as SendableChannel;
    client.on(Events.MessageCreate, async (message) => await uploadPics(message, picLogsChannel));
    client.on(Events.MessageDelete, async (message) => await deletePics(message, picLogsChannel));

    // Add role to new members that accepted the rules
    client.on(Events.GuildMemberUpdate, async (oldMember, newMember) => {
        if (oldMember.pending !== newMember.pending) newMember.roles.add(config.roles.mosesFan);
    });

    client.on(Events.MessageCreate, async (message) => {
        // Ping check
        if (message.content === "moses" && !message.author.bot) {
            return message.channel.send("pong!").then((msg: Message) => {
                msg.edit(`\`\`\`yaml\nClient latency: ${msg.createdTimestamp - message.createdTimestamp}ms\nWebSocket latency: ${client.ws.ping}ms\`\`\``);
                message.delete();
            });
        }

        const hasMedia = (message: Message) => message.embeds.some((embed) => embed.image || embed.thumbnail || embed.video) || message.attachments.size !== 0;

        // Add reactions to memes and pets
        if (message.channel.id === config.channels.memes && hasMedia(message)) {
            message.react(client.emojis.cache.get(config.emojis.upvote) ?? "👍");
            message.react(client.emojis.cache.get(config.emojis.downvote) ?? "👎");
            return;
        }
        if (message.channel.id === config.channels.pets && hasMedia(message)) {
            message.react(client.emojis.cache.get(config.emojis.catLove) ?? "🥰");
            return;
        }
    });

    // Send welcome messages
    client.on(Events.GuildMemberAdd, async (member) => {
        const dmWelcome = new EmbedBuilder()
            .setColor("#ff3fec")
            .setAuthor({ name: member.guild.name, iconURL: `https://cdn.discordapp.com/icons/${member.guild.id}/${member.guild.icon}.gif`, url: "https://discord.gg/cHs56zgFBy" })
            .setThumbnail("https://cdn.discordapp.com/attachments/980813644948463656/986291948430164028/mosesSpinHD.gif")
            .setTitle(`> :wave: Greetings ${member.user.username}!`)
            .setDescription(
                `My name is **\`${client.user.username}\`** and I would like to welcome you to\n**The Moses** ~~Cult~~ ***Club of Mutual Adoration!*** Originally, the server started out as a joke, however with time it just grew an we decided to go with it.\n\n*Missing the* **context** *on why tf you got invited here and don't know what this is all about?*\n Very well then. Gino/Mojżesz/***Moses*** sometimes says some stupid shit, so some dumbass who clearly has too much free time decided to make a discord bot that would store all of Moses' stupid \"quotes\" in a database.\nEvery day at **7:00am** (GMT+1) a random Moses Quote will be sent to the <#${config.channels.quotes}> channel. The daily quote message contains a ping. Don't like pings? You can toggle them in <#${config.channels.togglePings}>.\n\u200B`
            );
        member.send({ embeds: [dmWelcome] });

        const attachment = new AttachmentBuilder(member.user.displayAvatarURL());
        const serverWelcome = new EmbedBuilder()
            .setColor("Random")
            .setDescription(`> :wave: <@${member.user.id}> **has just joined \`${member.guild.name}\`**!`)
            .setThumbnail(`attachment://${member.user.avatar}.${member.user.displayAvatarURL().split(".").pop()?.split("?")[0]}`)
            .addFields({ name: "\u200B", value: "**ONE OF US!**", inline: true }, { name: "\u200B", value: "**ONE OF US!**", inline: true }, { name: "\u200B", value: "**ONE OF US!**", inline: true });

        const channel = client.channels.cache.get(config.channels.welcone) as SendableChannel;
        channel.send({ embeds: [serverWelcome], files: [attachment] });
    });

    // Initialize channel time map with current guild voice states
    const channelTimeMap = new Map<string, number>();
    client.guilds.cache.get(secrets.testGuildId)?.voiceStates.cache.forEach(async (voiceState) => channelTimeMap.set(voiceState.id, Date.now()));

    // Track voice time
    client.on(Events.VoiceStateUpdate, async (oldState, newState) => {
        if (oldState.member?.user.bot) return;

        // On join
        if (!oldState.channelId && newState.channelId) {
            channelTimeMap.set(newState.id, Date.now());
            return;
        }

        // On leave
        if (oldState.channelId && !newState.channelId) {
            const joinTime = channelTimeMap.get(newState.id);
            if (!joinTime) {
                console.log(`joinTime is undefined for ${newState.member?.user.username}`);
                return;
            }

            const timeSpent = Date.now() - joinTime;
            channelTimeMap.delete(newState.id);
            await VoiceTime.updateOne({ userId: newState.id }, { $inc: { time: timeSpent } }, { upsert: true });
        }
    });

    let cleanupInProgress: boolean = false;
    async function cleanup() {
        if (cleanupInProgress) return;
        cleanupInProgress = true;

        await VoiceTime.bulkWrite(
            Array.from(channelTimeMap.entries()).map(([userId, joinTime]) => {
                return { updateOne: { filter: { userId }, update: { $inc: { time: Date.now() - joinTime } }, upsert: true } };
            })
        );
        process.exit();
    }

    ["SIGINT", "SIGTERM", "SIGHUP", "SIGBREAK", "SIGUSR1", "SIGUSR2", "uncaughtException", "exit"].forEach((signal) => process.on(signal, cleanup));

    // Set bot presence based on environment
    if (secrets.environment === "production") {
        const presence = await Presence.findOne<IPresence>();
        if (presence) client.user.setPresence({ activities: [{ type: presence.type, name: presence.name }], status: presence.status });
        return;
    }
    client.user.setPresence({ activities: [{ type: ActivityType.Custom, name: "⚙️ TESTING MODE" }], status: "dnd" });
});

client.login(secrets.discordToken);
