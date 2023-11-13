import { Client, Events, GatewayIntentBits, Partials } from "discord.js";
import { commands } from "./commands";
import "./db/setup";

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildPresences,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.DirectMessages,
    ],
    partials: [Partials.Channel],
});

client.once(Events.ClientReady, async (client) => {
    console.log(`🟢 ${client.user.username} is now online!`);
});

client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isCommand()) return;
    const command = commands.get(interaction.commandName);
    if (!command) return;

    try {
        await command.run(interaction);
    } catch (err) {
        console.error(err);

        if (interaction.replied || interaction.deferred) {
            await interaction.followUp({ content: "There was an error while executing this command!", ephemeral: true });
        } else {
            await interaction.reply({ content: "There was an error while executing this command!", ephemeral: true });
        }
    }
});

if (!process.env.DISCORD_TOKEN) throw new Error("No Discord bot token provided. Set DISCORD_TOKEN environment variable.");

client.login(process.env.DISCORD_TOKEN);
