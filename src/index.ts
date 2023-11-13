import { Client, EmbedBuilder, Events, GatewayIntentBits, Partials } from "discord.js";
import { commands } from "./commands";
import "./db/setup";
import { IPresence } from "./db/types";
import Presence from "./models/bot/presence";

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
    console.log(`🟢 ${client.user.username} is now online!`);

    const presence = await Presence.findOne<IPresence>();
    if (presence) client.user.setPresence({ activities: [{ type: presence.type, name: presence.name }], status: presence.status });
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

if (!process.env.DISCORD_TOKEN) throw new Error("No Discord bot token provided. Set DISCORD_TOKEN environment variable.");

client.login(process.env.DISCORD_TOKEN);
