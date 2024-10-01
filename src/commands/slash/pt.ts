import { CommandScope, type SlashCommandObject } from "@/commands/types";
import config from "@/config.json";
import { PTLeaderboard } from "@/models/pt/leaderboard";
import { type IPTQuote, PTQuote } from "@/models/pt/quote";
import { getErrorReply, getInfoReply, getSuccessReply } from "@/utils/replyEmbeds";
import { type ApplicationCommandOptionChoiceData, type InteractionReplyOptions, PermissionsBitField, SlashCommandBuilder, type User } from "discord.js";

const pageSize = 15;

export default {
    builder: new SlashCommandBuilder()
        .setName("3pt")
        .setDescription("All of the 3pT quotes related commands.")
        .addSubcommand((subcommand) =>
            subcommand
                .setName("list")
                .setDescription("List all stored 3pT quotes (grouped by pages).")
                .addNumberOption((option) => option.setName("page").setDescription(`The page number you would like to see (there are ${pageSize} quotes per page).`).setRequired(true).setAutocomplete(true)),
        )
        .addSubcommand((subcommand) =>
            subcommand
                .setName("add")
                .setDescription("Add a new 3pT quote.")
                .addUserOption((option) => option.setName("author").setDescription("The author of the quote.").setRequired(true))
                .addStringOption((option) => option.setName("quote").setDescription("The quote to add.").setRequired(true)),
        )
        .addSubcommand((subcommand) =>
            subcommand
                .setName("edit")
                .setDescription("Edit an existing 3pT quote.")
                .addNumberOption((option) => option.setName("id").setDescription("The id number of the quote you would like to edit.").setRequired(true).setAutocomplete(true))
                .addStringOption((option) => option.setName("quote").setDescription("The new edited quote.").setRequired(true)),
        )
        .addSubcommand((subcommand) =>
            subcommand
                .setName("delete")
                .setDescription("Delete a 3pT quote.")
                .addNumberOption((option) => option.setName("id").setDescription("The id number of the quote you would like to delete.").setRequired(true).setAutocomplete(true)),
        )
        .addSubcommand((subcommand) => subcommand.setName("leaderboard").setDescription("Check the 3pT quote authors leaderboard.")),

    autocomplete: async (subcommand) => {
        const getRecentQuotesAutocomplete = async (): Promise<ApplicationCommandOptionChoiceData[]> =>
            PTQuote.aggregate<IPTQuote>([{ $sort: { id: -1 } }, { $limit: 25 }]).then((quotes) =>
                quotes.map(({ content, id }) => {
                    content = `#${id} → ${content.replace(/\n/g, " ")}`;
                    const name = content.length > 100 ? `${content.substring(0, 97)}...` : content;
                    return { name, value: id };
                }),
            );

        if (subcommand === "list") return Array.from({ length: Math.ceil((await PTQuote.countDocuments()) / pageSize) }, (_, i) => ({ name: i + 1, value: i + 1 }));
        if (subcommand === "edit" || subcommand === "delete") return await getRecentQuotesAutocomplete();
    },

    scope: CommandScope.Guild,

    run: async (interaction) => {
        const { options } = interaction;
        const subcommand = options.getSubcommand();

        if (!interaction.memberPermissions) throw new Error("Member permissions are not defined.");

        async function updateCounter() {
            if (!interaction.guild) return;
            interaction.guild.channels.cache.get(config.channels.ptCounter)?.edit({ name: `🔴 3pT Quotes ›› ${await PTQuote.countDocuments()}` });
        }

        switch (subcommand) {
            case "list":
                await interaction.reply(await list(options.getNumber("page") ?? 1));
                break;
            case "add":
                await interaction.reply(await add(options.getString("quote") as string, options.getUser("author") as User, interaction.user));
                updateCounter();
                break;
            case "edit":
                await interaction.reply(await edit(options.getNumber("id") as number, options.getString("quote") as string, interaction.memberPermissions, interaction.user));
                break;
            case "delete":
                await interaction.reply(await drop(options.getNumber("id") as number, interaction.memberPermissions, interaction.user));
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

    const documentCount = await PTQuote.countDocuments();
    if (documentCount === 0) return getErrorReply("There are no 3pT quotes stored in the database.");

    const totalPages = Math.ceil(documentCount / pageSize);
    if (page > totalPages) return getErrorReply(totalPages === 1 ? "There is only 1 page of quotes available." : `There are only ${totalPages} pages of quotes available.`);

    const quotes = await PTQuote.aggregate<IPTQuote>([{ $sort: { id: 1 } }, { $skip: (page - 1) * pageSize }, { $limit: pageSize }]);
    return getInfoReply(`3pT quotes *(page ${page} of ${totalPages})*:`, quotes.map((quote) => `**#${quote.id}** \`${quote.content.replace(/\n/, " ")}\`\n***— <@${quote.authorId}>***`).join("\n"));
}

async function add(quote: string, author: User, user: User): Promise<InteractionReplyOptions> {
    let modifiedContent = quote.trim();
    if (!quote.endsWith(".") && !quote.endsWith("?") && !quote.endsWith("!")) modifiedContent += ".";

    await PTQuote.create({ id: 0, content: quote, authorId: author.id, submitterId: user.id });

    return getSuccessReply("Quote added!", `**\`${quote}\`**\n*Said by: <@${author.id}>*`);
}

async function edit(id: number, newQuote: string, memberPermissions: PermissionsBitField, user: User): Promise<InteractionReplyOptions> {
    const quote = await PTQuote.findOne({ id });

    if (!quote) return getErrorReply(`Quote **\`#${id}\`** does not exist.`);

    const previousContent = quote.content;
    let modifiedContent = newQuote.trim();
    if (!newQuote.endsWith(".") && !newQuote.endsWith("?") && !newQuote.endsWith("!")) modifiedContent += ".";

    if (quote.content === newQuote) return getErrorReply("The new quote cannot be the same as the old one.");

    if (memberPermissions.has(PermissionsBitField.Flags.Administrator)) {
        quote.content = newQuote;
        await quote.save();
        return getSuccessReply("Quote edited!", `**from:** **\`${previousContent}\`**\n**to:** **\`${newQuote}\`**\n***(Admin mode)***`);
    }

    if (quote.submitterId === user.id) {
        quote.content = newQuote;
        await quote.save();
        return getSuccessReply("Quote edited!", `**from:** **\`${previousContent}\`**\n**to:** **\`${newQuote}\`**`);
    }

    return getErrorReply(`Quote **\`#${id}\`** was submitted by <@${quote.submitterId}>.\nIf you want it edited ask them or a server admin.`);
}

async function drop(id: number, memberPermissions: PermissionsBitField, user: User): Promise<InteractionReplyOptions> {
    const quote = await PTQuote.findOne({ id });

    if (!quote) return getErrorReply(`Quote **\`#${id}\`** does not exist.`);

    if (memberPermissions.has(PermissionsBitField.Flags.Administrator)) {
        quote._deleting = true;
        await quote.save();
        return getSuccessReply("Quote deleted!", `**\`${quote.id}\`** **\`${quote.content}\`** has been deleted.\n***(Admin mode)***`);
    }

    if (quote.submitterId === user.id) {
        quote._deleting = true;
        await quote.save();
        return getSuccessReply("Quote deleted!", `**\`${quote.id}\`** **\`${quote.content}\`** has been deleted.`);
    }

    return getErrorReply(`Quote **\`#${id}\`** was submitted by <@${quote.submitterId}>.\nIf you want it edited ask them or a server admin.`);
}

async function leaderboard(): Promise<InteractionReplyOptions> {
    const leaderboard = await PTLeaderboard.find();

    if (leaderboard.length === 0) return getErrorReply("The 3pT leaderboard is empty.");

    return getInfoReply("3pT quote authors leaderboard:", leaderboard.map((user, i) => `**#${i + 1}** <@${user.userId}> **→** **\`${user.count}\`**`).join("\n"));
}
