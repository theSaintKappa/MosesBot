import { ApplicationCommandOptionChoiceData, AutocompleteInteraction, ChatInputCommandInteraction, ContextMenuCommandBuilder, ContextMenuCommandInteraction, SlashCommandBuilder } from "discord.js";

interface CommandObject<TBuilder, TInteraction> {
    builder: TBuilder;
    scope: CommandScope;
    run: (interaction: TInteraction) => Promise<void>;
}

interface Autocomplete {
    autocomplete?: () => Promise<ApplicationCommandOptionChoiceData[]>;
}

export interface SlashCommandObject extends CommandObject<SlashCommandBuilder, ChatInputCommandInteraction>, Autocomplete {}

export interface ContextMenuCommandObject extends CommandObject<ContextMenuCommandBuilder, ContextMenuCommandInteraction> {}

export enum CommandScope {
    Guild = "GUILD",
    Global = "GLOBAL",
}
