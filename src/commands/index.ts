import {
    APIUser,
    ChatInputCommandInteraction,
    ContextMenuCommandInteraction,
    EmbedBuilder,
    REST,
    RESTPostAPIChatInputApplicationCommandsJSONBody,
    RESTPostAPIContextMenuApplicationCommandsJSONBody,
    Routes,
} from "discord.js";
import secrets from "../secrets";
import { CommandScope, ContextMenuCommandObject, SlashCommandObject } from "./types";

import reroll from "./contextMenu/reroll";
import aghpb from "./slash/aghpb";
import channel from "./slash/channel";
import clear from "./slash/clear";
import moses from "./slash/moses";
import presence from "./slash/presence";
import pt from "./slash/pt";
const commandObjects = new Set([reroll, aghpb, channel, clear, moses, presence, pt]);

const commands = new Map<string, SlashCommandObject | ContextMenuCommandObject>([...commandObjects].map((command) => [command.builder.name, command]));

// Register commands with REST client
try {
    const rest = new REST().setToken(secrets.discordToken);

    const clientUser = (await rest.get(Routes.user())) as APIUser;

    const [globalCommands, guildCommands] = [...commands.values()].reduce(
        (acc, command) => {
            acc[command.scope === CommandScope.Guild ? 1 : 0].push(command.builder.toJSON());
            return acc;
        },
        [[], []] as Array<RESTPostAPIChatInputApplicationCommandsJSONBody | RESTPostAPIContextMenuApplicationCommandsJSONBody>[]
    );

    globalCommands && (await rest.put(Routes.applicationCommands(clientUser.id), { body: globalCommands }));
    guildCommands && (await rest.put(Routes.applicationGuildCommands(clientUser.id, secrets.testGuildId), { body: guildCommands }));

    console.log(`🔷 Successfully loaded ${globalCommands.length + guildCommands.length} command(s)`);
} catch (err) {
    console.error(err);
}

export async function executeCommand(interaction: ChatInputCommandInteraction | ContextMenuCommandInteraction) {
    const command = commands.get(interaction.commandName);
    if (!command) return;

    try {
        await command.run(<ChatInputCommandInteraction & ContextMenuCommandInteraction>interaction);
    } catch (err) {
        console.error(err);

        const errorEmbed = new EmbedBuilder().setColor("#ff0000").setTitle(`An error occurred while processing your request.\nTry again later or contact a server admin.`);

        if (interaction.replied || interaction.deferred) await interaction.followUp({ embeds: [errorEmbed], ephemeral: true });
        else await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
    }
}
