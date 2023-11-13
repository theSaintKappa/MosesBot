import { Client, Events, GatewayIntentBits, Partials } from "discord.js";

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

client.once(Events.ClientReady, (client) => {
    console.log(`${client.user.username} is now online!`);
});

client.login(process.env.DISCORD_TOKEN);
