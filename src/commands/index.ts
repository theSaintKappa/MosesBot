import { APIUser, CommandInteraction, REST, RESTPostAPIChatInputApplicationCommandsJSONBody, Routes, SlashCommandBuilder } from "discord.js";
import secrets from "../secrets";

import aghpb from "./aghpb";
import moses from "./moses";
import presence from "./presence";
import pt from "./pt";
const commandObjects = [aghpb, moses, presence, pt];

export interface CommandObject {
    builder: SlashCommandBuilder;
    run: (interaction: CommandInteraction) => Promise<void>;
}

export const commands = new Map<string, CommandObject>(commandObjects.map((command) => [command.builder.name, command]));

const rest = new REST().setToken(secrets.discordToken);

try {
    const clientUser = (await rest.get(Routes.user())) as APIUser;

    const data = (await rest.put(Routes.applicationGuildCommands(clientUser.id, secrets.testGuildId), {
        body: [...commands.values()].map((command) => command.builder.toJSON()),
    })) as RESTPostAPIChatInputApplicationCommandsJSONBody[];

    console.log(`🔷 Successfully loaded ${data.length} slash command(s)`);
} catch (err) {
    console.error(err);
}
