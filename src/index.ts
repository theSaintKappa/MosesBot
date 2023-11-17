import { ActivityType, Client, EmbedBuilder, Events, GatewayIntentBits, Partials } from "discord.js";
import { commands } from "./commands";
import "./db/setup";
import { IPresence } from "./db/types";
import Presence from "./models/bot/presence";
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

    if (secrets.environment === "production") {
        const presence = await Presence.findOne<IPresence>();
        if (presence) client.user.setPresence({ activities: [{ type: presence.type, name: presence.name }], status: presence.status });
        return;
    }
    client.user.setPresence({ activities: [{ type: ActivityType.Custom, name: "⚙️ TESTING MODE" }], status: "dnd" });
});

client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    const command = commands.get(interaction.commandName);
    if (!command) return;

    try {
        await command.run(interaction);
    } catch (err) {
        console.error(err);

        const errorEmbed = new EmbedBuilder().setColor("#ff0000").setTitle(`An error occurred while processing your request.\nTry again later or contact a server admin.`);

        if (interaction.replied || interaction.deferred) {
            await interaction.followUp({ embeds: [errorEmbed], ephemeral: true });
        } else {
            await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        }
    }
});

client.login(secrets.discordToken);
