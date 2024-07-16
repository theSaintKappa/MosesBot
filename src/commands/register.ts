import { type AutocompleteInteraction, type ChatInputCommandInteraction, type ClientUser, type ContextMenuCommandInteraction, EmbedBuilder, REST, type RESTPostAPIChatInputApplicationCommandsJSONBody, type RESTPostAPIContextMenuApplicationCommandsJSONBody, Routes } from "discord.js";
import { logger } from "../utils/logger";
import { getErrorReply } from "../utils/replyEmbeds";
import secrets from "../utils/secrets";
import commandObjects from "./list";
import { CommandScope, type ContextMenuCommandObject, type SlashCommandObject } from "./types";

const commands = new Map<string, SlashCommandObject | ContextMenuCommandObject>([...commandObjects].map((command) => [command.builder.name, command]));

const log = logger("Commands");

// Register commands with REST client
export async function registerCommands(clientUser: ClientUser) {
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

        log.info(`Registered ${globalCommands.length + guildCommands.length} commands!`);
    } catch (err) {
        log.error(`Failed to register commands: ${err}`);
    }
}

export async function executeCommand(interaction: ChatInputCommandInteraction | ContextMenuCommandInteraction) {
    const command = commands.get(interaction.commandName);
    if (!command) return;

    try {
        await command.run(<ChatInputCommandInteraction & ContextMenuCommandInteraction>interaction);
    } catch (err) {
        log.error(`Failed to execute command: ${err}`);

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
        log.error(`Failed to autocomplete command: ${err}`);
    }
}
