import { APIUser, CommandInteraction, EmbedBuilder, REST, RESTPostAPIChatInputApplicationCommandsJSONBody, Routes, SlashCommandBuilder } from "discord.js";
import secrets from "../secrets";
import { CommandObject, CommandType } from "./types";

import aghpb from "./aghpb";
import clear from "./clear";
import moses from "./moses";
import presence from "./presence";
import pt from "./pt";
const commandObjects = [aghpb, clear, moses, presence, pt];

const commands = new Map<string, CommandObject>(commandObjects.map((command) => [command.builder.name, command]));

const rest = new REST().setToken(secrets.discordToken);

try {
    const clientUser = (await rest.get(Routes.user())) as APIUser;
    const [globalCommands, guildCommands] = [...commands.values()].reduce(
        (acc, command) => {
            acc[command.type === CommandType.Guild ? 1 : 0].push(command.builder.toJSON());
            return acc;
        },
        [[], []] as RESTPostAPIChatInputApplicationCommandsJSONBody[][]
    );

    globalCommands && (await rest.put(Routes.applicationCommands(clientUser.id), { body: globalCommands }));
    guildCommands && (await rest.put(Routes.applicationGuildCommands(clientUser.id, secrets.testGuildId), { body: guildCommands }));

    console.log(`🔷 Successfully loaded ${globalCommands.length + guildCommands.length} slash command(s)`);
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
