import { CommandInteraction, SlashCommandBuilder } from "discord.js";

export interface CommandObject {
    builder: SlashCommandBuilder;
    type: CommandType;
    run: (interaction: CommandInteraction) => Promise<void>;
}

export enum CommandType {
    Guild = "GUILD",
    Global = "GLOBAL",
}
