import { ActivityType, Client, EmbedBuilder, Events, GatewayIntentBits, MessageType, NewsChannel, Partials, TextChannel } from "discord.js";
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
    console.log(`⚙️  Running in ${secrets.environment} mode.`);
    console.log(`🟢 ${client.user.username} is now online!`);

    scheduleJobs(client);

    const picLogsChannel = client.channels.cache.get("1058118420186542120") as TextChannel | NewsChannel;
    client.on(Events.MessageCreate, async (message) => {
        await uploadPics(message, picLogsChannel);
    });
    client.on(Events.MessageDelete, async (message) => {
        await deletePics(message, picLogsChannel);
    });

    if (secrets.environment === "production") {
        const presence = await Presence.findOne<IPresence>();
        if (presence) client.user.setPresence({ activities: [{ type: presence.type, name: presence.name }], status: presence.status });
        return;
    }
    client.user.setPresence({ activities: [{ type: ActivityType.Custom, name: "⚙️ TESTING MODE" }], status: "dnd" });
});

client.on(Events.InteractionCreate, async (interaction) => {
    if (interaction.isChatInputCommand()) executeCommand(interaction);
});

client.login(secrets.discordToken);
