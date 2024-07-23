import { CommandScope, type SlashCommandObject } from "@/commands/types";
import config from "@/config.json";
import type { ILeaderboard, IMosesQuote } from "@/db";
import MosesLeaderboard from "@/models/moses/leaderboard.schema";
import MosesQuote from "@/models/moses/quote.schema";
import { getRecentQuotesAutocomplete } from "@/utils/autocomplete";
import { getErrorReply, getInfoReply, getSuccessReply } from "@/utils/replyEmbeds";
import { type InteractionReplyOptions, PermissionsBitField, SlashCommandBuilder } from "discord.js";

const pageSize = 15;

export default {
    builder: new SlashCommandBuilder()
        .setName("moses")
        .setDescription("All of the Moses quotes related commands.")
        .addSubcommand((subcommand) =>
            subcommand
                .setName("list")
                .setDescription("List all stored Moses quotes (grouped by pages).")
                .addNumberOption((option) => option.setName("page").setDescription(`The page number you would like to see (there are ${pageSize} quotes per page).`).setRequired(true).setAutocomplete(true)),
        )
        .addSubcommand((subcommand) =>
            subcommand
                .setName("add")
                .setDescription("Add a new Moses quote.")
                .addStringOption((option) => option.setName("quote").setDescription("The quote to add.").setRequired(true)),
        )
        .addSubcommand((subcommand) =>
            subcommand
                .setName("edit")
                .setDescription("Edit an existing Moses quote.")
                .addNumberOption((option) => option.setName("id").setDescription("The id number of the quote you would like to edit.").setRequired(true).setAutocomplete(true))
                .addStringOption((option) => option.setName("new-quote").setDescription("The new edited quote.").setRequired(true)),
        )
        .addSubcommand((subcommand) =>
            subcommand
                .setName("delete")
                .setDescription("Delete a Moses quote.")
                .addNumberOption((option) => option.setName("id").setDescription("The id number of the quote you would like to delete.").setRequired(true).setAutocomplete(true)),
        )
        .addSubcommand((subcommand) => subcommand.setName("leaderboard").setDescription("Check the Moses quote adders leaderboard.")),

    autocomplete: async (subcommand) => {
        if (subcommand === "list") return Array.from({ length: Math.ceil((await MosesQuote.countDocuments()) / pageSize) }, (_, i) => ({ name: i + 1, value: i + 1 }));
        if (subcommand === "edit" || subcommand === "delete") return await getRecentQuotesAutocomplete();
    },

    scope: CommandScope.Guild,

    run: async (interaction) => {
        const { options, memberPermissions, user } = interaction;
        if (!memberPermissions) throw new Error("Member permissions are null.");
        const subcommand = options.getSubcommand();

        async function updateCounter() {
            if (!interaction.guild) return;
            interaction.guild.channels.cache.get(config.channels.mosesCounter)?.edit({ name: `🟣 Moses Quotes ›› ${await MosesQuote.countDocuments()}` });
        }

        switch (subcommand) {
            case "list":
                await interaction.reply(await list(options.getNumber("page") ?? 1));
                break;
            case "add":
                await interaction.reply(await add(options.getString("quote") as string, user.id));
                updateCounter();
                break;
            case "edit":
                await interaction.reply(await edit(options.getNumber("id") as number, options.getString("quote") as string, memberPermissions, user.id));
                break;
            case "delete":
                await interaction.reply(await drop(options.getNumber("id") as number, memberPermissions, user.id));
                updateCounter();
                break;
            case "leaderboard":
                await interaction.reply(await leaderboard());
                break;
        }
    },
} as SlashCommandObject;

async function list(page: number): Promise<InteractionReplyOptions> {
    if (page < 1) return getErrorReply("Page number cannot be less than 1.");

    const documentCount = await MosesQuote.countDocuments();
    if (documentCount === 0) return getErrorReply("There are no Moses quotes stored in the database.");

    const totalPages = Math.ceil(documentCount / pageSize);
    if (page > totalPages) return getErrorReply(totalPages === 1 ? "There is only 1 page of quotes available." : `There are only ${totalPages} pages of quotes available.`);

    const quotes = await MosesQuote.aggregate<IMosesQuote>([{ $sort: { id: 1 } }, { $skip: (page - 1) * pageSize }, { $limit: pageSize }]);

    return getInfoReply(`Moses quotes *(page ${page} of ${totalPages})*:`, quotes.map((quote) => `**#${quote.id}** \`${quote.content.replace(/\n/, " ")}\``).join("\n"));
}

async function add(content: string, submitterId: string): Promise<InteractionReplyOptions> {
    let modifiedContent = content.trim();
    if (!content.endsWith(".") && !content.endsWith("?") && !content.endsWith("!")) modifiedContent += ".";

    await MosesQuote.create({ id: 0, content, submitterId } as IMosesQuote);

    return getSuccessReply("Quote added!", `**\`${content}\`**`);
}

async function edit(id: number, newQuote: string, memberPermissions: PermissionsBitField, userId: string): Promise<InteractionReplyOptions> {
    const quote = await MosesQuote.findOne({ id });

    if (!quote) return getErrorReply(`Quote **\`#${id}\`** does not exist.`);

    let modifiedContent = newQuote.trim();
    if (!newQuote.endsWith(".") && !newQuote.endsWith("?") && !newQuote.endsWith("!")) modifiedContent += ".";

    if (quote.content === newQuote) return getErrorReply("The new quote cannot be the same as the old one.");

    if (memberPermissions.has(PermissionsBitField.Flags.Administrator)) {
        await MosesQuote.updateOne({ id }, { content: newQuote });
        return getSuccessReply("Quote edited!", `**from:** **\`${quote.content}\`**\n**to:** **\`${newQuote}\`**\n***(Admin mode)***`);
    }

    if (quote.submitterId === userId) {
        await MosesQuote.updateOne({ id }, { content: newQuote });
        return getSuccessReply("Quote edited!", `**from:** **\`${quote.content}\`**\n**to:** **\`${newQuote}\`**`);
    }

    return getErrorReply(`Quote **\`#${id}\`** was submitted by <@${quote.submitterId}>.\nIf you want it edited ask them or a server admin.`);
}

async function drop(id: number, memberPermissions: PermissionsBitField, userId: string): Promise<InteractionReplyOptions> {
    const quote = await MosesQuote.findOne({ id });
    if (!quote) return getErrorReply(`Quote **\`#${id}\`** does not exist.`);

    if (memberPermissions.has(PermissionsBitField.Flags.Administrator)) {
        await MosesQuote.deleteOne({ id });
        return getSuccessReply("Quote deleted!", `**\`${quote.id}\`** **\`${quote.content}\`** has been deleted.\n***(Admin mode)***`);
    }

    if (quote.submitterId === userId) {
        await MosesQuote.deleteOne({ id });
        return getSuccessReply("Quote deleted!", `**\`${quote.id}\`** **\`${quote.content}\`** has been deleted.`);
    }

    return getErrorReply(`Quote **\`#${id}\`** was submitted by <@${quote.submitterId}>.\nIf you want it edited ask them or a server admin.`);
}

async function leaderboard(): Promise<InteractionReplyOptions> {
    const leaderboard = await MosesLeaderboard.find<ILeaderboard>();

    if (leaderboard.length === 0) return getErrorReply("The Moses leaderboard is empty.");

    return getInfoReply("Moses quote submiters leaderboard:", leaderboard.map((user, i) => `**#${i + 1}** <@${user.userId}> **→** **\`${user.count}\`**`).join("\n"));
}
