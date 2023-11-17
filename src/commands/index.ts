import { APIUser, CommandInteraction, EmbedBuilder, REST, RESTPostAPIChatInputApplicationCommandsJSONBody, Routes, SlashCommandBuilder } from "discord.js";
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

const commands = new Map<string, CommandObject>(commandObjects.map((command) => [command.builder.name, command]));

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

export async function executeCommand(interaction: CommandInteraction) {
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
}
