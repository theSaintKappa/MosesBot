import { ChatInputCommandInteraction, ContextMenuCommandBuilder, ContextMenuCommandInteraction, SlashCommandBuilder } from "discord.js";

interface CommandObject<TBuilder, TInteraction> {
    builder: TBuilder;
    scope: CommandScope;
    run: (interaction: TInteraction) => Promise<void>;
}

export type SlashCommandObject = CommandObject<SlashCommandBuilder, ChatInputCommandInteraction>;

export type ContextMenuCommandObject = CommandObject<ContextMenuCommandBuilder, ContextMenuCommandInteraction>;

export enum CommandScope {
    Guild = "GUILD",
    Global = "GLOBAL",
}
