import { CommandInteraction, REST, RESTPostAPIChatInputApplicationCommandsJSONBody, Routes, SlashCommandBuilder } from "discord.js";
import { readdir } from "node:fs/promises";

export const commands = new Map<string, CommandObject>();

const commandsPath = import.meta.dir + "/commands";
const commandFiles = await readdir(commandsPath);
for (const file of commandFiles) {
    const command: CommandObject = await import(commandsPath + "/" + file).then((module) => module.default);
    commands.set(command.builder.name, command);
}

const rest = new REST().setToken(process.env.DISCORD_TOKEN!!);

try {
    const data = (await rest.put(Routes.applicationGuildCommands(process.env.CLIENT_ID!!, process.env.TEST_GUILD_ID!!), {
        body: [...commands.values()].map((command) => command.builder.toJSON()),
    })) as RESTPostAPIChatInputApplicationCommandsJSONBody[];

    console.log(`🔷 Successfully loaded ${data.length} slash command(s)`);
} catch (err) {
    console.error(err);
}

export interface CommandObject {
    builder: SlashCommandBuilder;
    run: (interaction: CommandInteraction) => Promise<void>;
}
