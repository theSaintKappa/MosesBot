import { InteractionReplyOptions, PermissionsBitField, SlashCommandBuilder, User } from "discord.js";
import { ILeaderboard, IPtQuote } from "../../db/types";
import PtLeaderboard from "../../models/pt/leaderboard.schema";
import PtQuote from "../../models/pt/quote.schema";
import { getErrorReply, getInfoReply, getSuccessReply } from "../../utils/replyEmbeds";
import { CommandScope, SlashCommandObject } from "../types";

const pageSize = 15;

export default {
    builder: new SlashCommandBuilder()
        .setName("3pt")
        .setDescription("All 3pT quotes related commands.")
        .addSubcommand((subcommand) =>
            subcommand
                .setName("list")
                .setDescription("List all stored 3pT quotes.")
                .addNumberOption((option) =>
                    option.setName("page").setDescription(`The page number you would like to see (there are ${pageSize} quotes per page).`).setRequired(false).setAutocomplete(true)
                )
        )
        .addSubcommand((subcommand) =>
            subcommand
                .setName("add")
                .setDescription("Add a new 3pT quote.")
                .addUserOption((option) => option.setName("author").setDescription("The author of the quote.").setRequired(true))
                .addStringOption((option) => option.setName("quote").setDescription("The quote to add.").setRequired(true))
        )
        .addSubcommand((subcommand) =>
            subcommand
                .setName("edit")
                .setDescription("Edit an existing 3pT quote.")
                .addNumberOption((option) => option.setName("id").setDescription("The id of the quote you would like to edit. To check quote id's, run: /3pT list <page>.").setRequired(true))
                .addStringOption((option) => option.setName("quote").setDescription("The new quote.").setRequired(true))
        )
        .addSubcommand((subcommand) =>
            subcommand
                .setName("delete")
                .setDescription("Delete a 3pT quote.")
                .addNumberOption((option) => option.setName("id").setDescription("The id of the quote you would like to delete. To check quote id's, run: /3pT list <page>.").setRequired(true))
        )
        .addSubcommand((subcommand) => subcommand.setName("leaderboard").setDescription("Check the 3pT quote authors leaderboard.")),

    autocomplete: async () => {
        const documentCount = await PtQuote.countDocuments();
        const totalPages = Math.ceil(documentCount / pageSize);

        return Array.from({ length: totalPages }, (_, i) => ({ name: `${i + 1}`, value: i + 1 }));
    },

    scope: CommandScope.Guild,

    run: async (interaction) => {
        const { options } = interaction;
        const subcommand = options.getSubcommand();

        switch (subcommand) {
            case "list":
                await interaction.reply(await list(options.getNumber("page") ?? 1));
                break;
            case "add":
                await interaction.reply(await add(options.getString("quote")!!, options.getUser("author")!!, interaction.user));
                break;
            case "edit":
                await interaction.reply(await edit(options.getNumber("id")!!, options.getString("quote")!!, interaction.memberPermissions!!, interaction.user!!));
                break;
            case "delete":
                await interaction.reply(await drop(options.getNumber("id")!!, interaction.memberPermissions!!, interaction.user!!));
                break;
            case "leaderboard":
                await interaction.reply(await leaderboard());
                break;
        }
    },
} as SlashCommandObject;

async function list(page: number): Promise<InteractionReplyOptions> {
    if (page < 1) return getErrorReply(`Page number cannot be less than 1.`);

    const documentCount = await PtQuote.countDocuments();
    if (documentCount === 0) return getErrorReply("There are no 3pT quotes stored in the database.");

    const totalPages = Math.ceil(documentCount / pageSize);
    if (page > totalPages) return getErrorReply(totalPages === 1 ? `There is only 1 page of quotes available.` : `There are only ${totalPages} pages of quotes available.`);

    const quotes = await PtQuote.aggregate<IPtQuote>([{ $sort: { id: 1 } }, { $skip: (page - 1) * pageSize }, { $limit: pageSize }]);
    return getInfoReply(`3pT quotes *(page ${page} of ${totalPages})*:`, quotes.map((quote) => `**#${quote.id}** \`${quote.content.replace(/\n/, " ")}\`\n***— <@${quote.authorId}>***`).join("\n"));
}

async function add(quote: string, author: User, user: User): Promise<InteractionReplyOptions> {
    if (!quote.endsWith(".") && !quote.endsWith("?") && !quote.endsWith("!")) quote += ".";

    await PtQuote.create({ id: 0, content: quote, authorId: author.id, submitterId: user.id });

    return getSuccessReply(`Quote added!`, `**\`${quote}\`**\n*Said by: <@${author.id}>*`);
}

async function edit(id: number, newQuote: string, memberPermissions: PermissionsBitField, user: User): Promise<InteractionReplyOptions> {
    const quote = await PtQuote.findOne({ id });

    if (!quote) return getErrorReply(`Quote **\`#${id}\`** does not exist.`);

    if (!newQuote.endsWith(".") && !newQuote.endsWith("?") && !newQuote.endsWith("!")) newQuote += ".";

    if (quote.content === newQuote) return getErrorReply(`The new quote cannot be the same as the old one.`);

    if (memberPermissions.has(PermissionsBitField.Flags.Administrator)) {
        await PtQuote.updateOne({ id }, { content: newQuote });
        return getSuccessReply(`Quote edited!`, `**from:** **\`${quote.content}\`**\n**to:** **\`${newQuote}\`**\n***(Admin mode)***`);
    }

    if (quote.submitterId === user.id) {
        await PtQuote.updateOne({ id }, { content: newQuote });
        return getSuccessReply(`Quote edited!`, `**from:** **\`${quote.content}\`**\n**to:** **\`${newQuote}\`**`);
    }

    return getErrorReply(`Quote **\`#${id}\`** was submitted by <@${quote.submitterId}>.\nIf you want it edited ask them or a server admin.`);
}

async function drop(id: number, memberPermissions: PermissionsBitField, user: User): Promise<InteractionReplyOptions> {
    const quote = await PtQuote.findOne({ id });

    if (!quote) return getErrorReply(`Quote **\`#${id}\`** does not exist.`);

    if (memberPermissions.has(PermissionsBitField.Flags.Administrator)) {
        await PtQuote.deleteOne({ id });
        return getSuccessReply(`Quote deleted!`, `**\`${quote.id}\`** **\`${quote.content}\`** has been deleted.\n***(Admin mode)***`);
    }

    if (quote.submitterId === user.id) {
        await PtQuote.deleteOne({ id });
        return getSuccessReply(`Quote deleted!`, `**\`${quote.id}\`** **\`${quote.content}\`** has been deleted.`);
    }

    return getErrorReply(`Quote **\`#${id}\`** was submitted by <@${quote.submitterId}>.\nIf you want it edited ask them or a server admin.`);
}

async function leaderboard(): Promise<InteractionReplyOptions> {
    const leaderboard = await PtLeaderboard.find<ILeaderboard>();

    if (leaderboard.length === 0) return getErrorReply("The 3pT leaderboard is empty.");

    return getInfoReply(`3pT quote authors leaderboard:`, leaderboard.map((user, i) => `**#${i + 1}** <@${user.userId}> **→** **\`${user.count}\`**`).join("\n"));
}
