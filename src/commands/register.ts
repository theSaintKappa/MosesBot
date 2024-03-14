import { type AutocompleteInteraction, type ChatInputCommandInteraction, type ClientUser, type ContextMenuCommandInteraction, EmbedBuilder, REST, type RESTPostAPIChatInputApplicationCommandsJSONBody, type RESTPostAPIContextMenuApplicationCommandsJSONBody, Routes } from "discord.js";
import { getErrorReply } from "../utils/replyEmbeds";
import secrets from "../utils/secrets";
import commandObjects from "./list";
import { CommandScope, type ContextMenuCommandObject, type SlashCommandObject } from "./types";

const commands = new Map<string, SlashCommandObject | ContextMenuCommandObject>([...commandObjects].map((command) => [command.builder.name, command]));

// Register commands with REST client
export async function registerCommands(clientUser: ClientUser) {
    console.log("╔ ⭐ \x1b[33mRegistering commands...\x1b[0m");
    try {
        const rest = new REST().setToken(secrets.discordToken);

        const [globalCommands, guildCommands] = [...commands.values()].reduce(
            (acc, command) => {
                acc[command.scope === CommandScope.Guild ? 1 : 0].push(command.builder.toJSON());
                return acc;
            },
            [[], []] as Array<RESTPostAPIChatInputApplicationCommandsJSONBody | RESTPostAPIContextMenuApplicationCommandsJSONBody>[],
        );

        globalCommands && (await rest.put(Routes.applicationCommands(clientUser.id), { body: globalCommands }));
        guildCommands && (await rest.put(Routes.applicationGuildCommands(clientUser.id, secrets.testGuildId), { body: guildCommands }));

        console.log(`╚ ☑️  \x1b[35mSuccessfully registered ${globalCommands.length + guildCommands.length} commands!\x1b[0m`);
    } catch (err) {
        console.error(err);
    }
}

export async function executeCommand(interaction: ChatInputCommandInteraction | ContextMenuCommandInteraction) {
    const command = commands.get(interaction.commandName);
    if (!command) return;

    try {
        await command.run(<ChatInputCommandInteraction & ContextMenuCommandInteraction>interaction);
    } catch (err) {
        console.error(err);

        const errorReply = getErrorReply.bind(null, "An error occurred while processing your request.\nTry again later or contact a server admin.");
        interaction.replied || interaction.deferred ? await interaction.followUp(errorReply()) : await interaction.reply(errorReply());
    }
}

export async function autocomplete(interaction: AutocompleteInteraction) {
    const command = commands.get(interaction.commandName) as SlashCommandObject;
    if (!command || !command.autocomplete) return;

    try {
        await interaction.respond(await command.autocomplete(interaction.options.getSubcommand()));
    } catch (err) {
        console.error(err);
    }
}
