import { ActivityType, AttachmentBuilder, Client, EmbedBuilder, Events, GatewayIntentBits, type Message, MessageType, type PartialMessage, Partials } from "discord.js";
import { autocomplete, executeCommand, registerCommands } from "./commands/register";
import config from "./config.json";
import { type IPresence, connectMongo } from "./db";
import { updateBotDescriptionQuote } from "./features/botDescription";
import { uploadPics } from "./features/pics";
import { scheduleJobs } from "./features/scheduler";
import { initializeVoiceTime } from "./features/voiceTime";
import Presence from "./models/bot/presence";
import { logger } from "./utils/logger";
import secrets from "./utils/secrets";

const log = logger("Client");

log(`⚙️  Running in ${secrets.environment} mode`);

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildPresences, GatewayIntentBits.GuildVoiceStates, GatewayIntentBits.GuildMessageReactions, GatewayIntentBits.MessageContent, GatewayIntentBits.DirectMessages],
    partials: [Partials.Channel, Partials.Message, Partials.Reaction],
});

await connectMongo();

client.once(Events.ClientReady, async (client) => {
    log(`🟢 ${client.user.username} is now online!`);

    if (secrets.environment === "production") updateBotDescriptionQuote(client);

    // Schedule cron jobs
    scheduleJobs(client);

    // Initialize voice time tracking
    initializeVoiceTime(client, client.channels.cache.get(config.channels.voiceTime) as SendableChannel);

    // Register slash commands
    registerCommands(client.user);

    // Execute commands
    client.on(Events.InteractionCreate, async (interaction) => {
        if (interaction.isChatInputCommand() || interaction.isContextMenuCommand()) return executeCommand(interaction);
        if (interaction.isAutocomplete()) return autocomplete(interaction);
    });

    // Upload and delete pics
    const picLogsChannel = client.channels.cache.get(config.channels.picsLog) as SendableChannel;
    const isUploadRequest = (message: Message | PartialMessage) => !message.guildId && message.attachments.size !== 0 && message.type === MessageType.Default && !message.author.bot;
    client.on(Events.MessageCreate, async (message) => {
        const guildMember = await client.guilds.cache.get(secrets.testGuildId)?.members.fetch(message.author.id);
        if (isUploadRequest(message)) await uploadPics(message, picLogsChannel, guildMember);
    });

    // Add role to new members that accepted the rules
    client.on(Events.GuildMemberUpdate, async (oldMember, newMember) => {
        if (oldMember.pending !== newMember.pending) newMember.roles.add(config.roles.mosesFan);
    });

    client.on(Events.MessageReactionAdd, async (reaction, user) => {
        if (reaction.message.id === config.messages.togglePings && reaction.emoji.name === "✅") {
            const member = reaction.message.guild?.members.cache.get(user.id);
            if (member) member.roles.add(config.roles.mosesEnjoyer);
        }
    });
    client.on(Events.MessageReactionRemove, async (reaction, user) => {
        if (reaction.message.id === config.messages.togglePings && reaction.emoji.name === "✅") {
            const member = reaction.message.guild?.members.cache.get(user.id);
            if (member) member.roles.remove(config.roles.mosesEnjoyer);
        }
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
                `My name is **\`${client.user.username}\`** and I would like to welcome you to\n**The Moses** ~~Cult~~ ***Club of Mutual Adoration!*** Originally, the server started out as a joke, however with time it just grew an we decided to go with it.\n\n*Missing the* **context** *on why tf you got invited here and don't know what this is all about?*\n Very well then. Gino/Mojżesz/***Moses*** sometimes says some stupid shit, so some dumbass who clearly has too much free time decided to make a discord bot that would store all of Moses' stupid \"quotes\" in a database.\nEvery day at **7:00am** (GMT+1) a random Moses Quote will be sent to the <#${config.channels.quotes}> channel. The daily quote message contains a ping. Don't like pings? You can toggle them in <#${config.channels.togglePings}>.\n\u200B`,
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

    // Set bot presence based on environment
    if (secrets.environment === "production") {
        const presence = await Presence.findOne<IPresence>();
        if (presence) client.user.setPresence({ activities: [{ type: presence.type, name: presence.name }], status: presence.status });
        return;
    }
    client.user.setPresence({ activities: [{ type: ActivityType.Custom, name: "⚙️ TESTING MODE" }], status: "dnd" });
});

client.login(secrets.discordToken);
