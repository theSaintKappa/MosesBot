import { CommandInteractionOptionResolver, EmbedBuilder, InteractionReplyOptions, PermissionsBitField, SlashCommandBuilder, User } from "discord.js";
import { ILeaderboard, IPtQuote, SchemaWithMetadata } from "../../db/types";
import PtLeaderboard from "../../models/pt/leaderboard.schema";
import PtQuote from "../../models/pt/quote.schema";
import { CommandScope, SlashCommandObject } from "../types";

export default {
    builder: new SlashCommandBuilder()
        .setName("3pt")
        .setDescription("All 3pT quotes related commands.")
        .addSubcommand((subcommand) =>
            subcommand
                .setName("list")
                .setDescription("List all stored 3pT quotes.")
                .addNumberOption((option) => option.setName("page").setDescription("The page of quotes you would like to see (every page has 15 quotes in it).").setRequired(false))
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

    scope: CommandScope.Guild,

    run: async (interaction) => {
        const subcommand = interaction.options.data[0].name;
        const args = <CommandInteractionOptionResolver>interaction.options;

        switch (subcommand) {
            case "list":
                await interaction.reply(await list(args.getNumber("page") ?? 1));
                break;
            case "add":
                await interaction.reply(await add(args.getString("quote")!!, args.getUser("author")!!, interaction.user));
                break;
            case "edit":
                await interaction.reply(await edit(args.getNumber("id")!!, args.getString("quote")!!, interaction.memberPermissions!!, interaction.user!!));
                break;
            case "delete":
                await interaction.reply(await drop(args.getNumber("id")!!, interaction.memberPermissions!!, interaction.user!!));
                break;
            case "leaderboard":
                await interaction.reply(await leaderboard());
                break;
        }
    },
} as SlashCommandObject;

const infoEmbed = new EmbedBuilder().setColor("#00c8ff").setFooter({ text: "3pT quotes" });
const successEmbed = new EmbedBuilder().setColor("#00ff3c").setFooter({ text: "3pT quotes" });
const errorEmbed = new EmbedBuilder().setColor("#ff0000");

async function list(page: number): Promise<InteractionReplyOptions> {
    const pageSize = 15;

    if (page < 1) return { embeds: [errorEmbed.setTitle("Page number must be greater than 0.")], ephemeral: true };

    const quotesWithMetadata = await PtQuote.aggregate<SchemaWithMetadata<IPtQuote[]>>([
        {
            $facet: {
                metadata: [{ $count: "totalDocuments" }],
                data: [{ $skip: (page - 1) * pageSize }, { $limit: pageSize }],
            },
        },
    ]);

    const quotes = quotesWithMetadata[0].data;
    const totalQuotes = quotesWithMetadata[0].metadata[0].totalDocuments;
    const validPages = Math.ceil(totalQuotes / pageSize);

    if (totalQuotes === 0) return { embeds: [errorEmbed.setDescription("❌ There are no 3pT quotes stored in the database.")], ephemeral: true };
    if (page > validPages)
        return {
            embeds: [errorEmbed.setDescription(validPages == 1 ? `❌ There is only 1 page of quotes available.` : `❌ There are only ${validPages} pages of quotes available.`)],
            ephemeral: true,
        };

    let quotesString = "";
    for (const quote of quotes) {
        quotesString += `**#${quote.id}** \`${quote.content}\`\n`;
    }

    return { embeds: [infoEmbed.setTitle(`> 💛 3pT quotes *(page ${page} of ${validPages})*:`).setDescription(quotesString)] };
}

async function add(quote: string, author: User, user: User): Promise<InteractionReplyOptions> {
    if (!quote.endsWith(".") && !quote.endsWith("?") && !quote.endsWith("!")) quote += ".";
    await PtQuote.create({ id: 0, content: quote, authorId: author.id, submitterId: user.id });

    return { embeds: [successEmbed.setTitle(`> ✅ Quote added!`).setDescription(`**\`${quote}\`**\n*Said by: <@${author.id}>*`)] };
}

async function edit(id: number, newQuote: string, memberPermissions: PermissionsBitField, user: User): Promise<InteractionReplyOptions> {
    const quote = await PtQuote.findOne({ id });

    if (!quote) return { embeds: [errorEmbed.setDescription(`❌ Quote **\`#${id}\`** does not exist.`)], ephemeral: true };

    if (!newQuote.endsWith(".") && !newQuote.endsWith("?") && !newQuote.endsWith("!")) newQuote += ".";

    if (quote.content === newQuote) return { embeds: [errorEmbed.setDescription(`❌ The new quote cannot be the same as the old one.`)], ephemeral: true };

    if (memberPermissions.has(PermissionsBitField.Flags.Administrator)) {
        await PtQuote.updateOne({ id }, { content: newQuote });
        return { embeds: [successEmbed.setTitle(`> ✅ Quote edited!`).setDescription(`**from:** **\`${quote.content}\`**\n**to:** **\`${newQuote}\`**\n***(Admin mode)***`)] };
    }

    if (quote.submitterId === user.id) {
        await PtQuote.updateOne({ id }, { content: newQuote });
        return { embeds: [successEmbed.setTitle(`> ✅ Quote edited!`).setDescription(`**from:** **\`${quote.content}\`**\n**to:** **\`${newQuote}\`**`)] };
    }

    return { embeds: [errorEmbed.setDescription(`❌ Quote **\`#${id}\`** was submitted by <@${quote.submitterId}>.\nIf you want it edited ask them or a server admin.`)], ephemeral: true };
}

async function drop(id: number, memberPermissions: PermissionsBitField, user: User): Promise<InteractionReplyOptions> {
    const quote = await PtQuote.findOne({ id });

    if (!quote) return { embeds: [errorEmbed.setDescription(`❌ Quote **\`#${id}\`** does not exist.`)], ephemeral: true };

    if (memberPermissions.has(PermissionsBitField.Flags.Administrator)) {
        await PtQuote.deleteOne({ id });
        return { embeds: [successEmbed.setTitle(`> ✅ Quote deleted!`).setDescription(`**\`${quote.id}\`** **\`${quote.content}\`** has been deleted.\n***(Admin mode)***`)] };
    }

    if (quote.submitterId === user.id) {
        await PtQuote.deleteOne({ id });
        return { embeds: [successEmbed.setTitle(`> ✅ Quote deleted!`).setDescription(`**\`${quote.id}\`** **\`${quote.content}\`** has been deleted.`)] };
    }

    return { embeds: [errorEmbed.setDescription(`❌ Quote **\`#${id}\`** was submitted by <@${quote.submitterId}>.\nIf you want it edited ask them or a server admin.`)], ephemeral: true };
}

async function leaderboard(): Promise<InteractionReplyOptions> {
    const leaderboard = await PtLeaderboard.find<ILeaderboard>();

    if (leaderboard.length === 0) return { embeds: [errorEmbed.setDescription("❌ The 3pT leaderboard is empty.")], ephemeral: true };

    let leaderboardString = "";
    for (let [i, user] of leaderboard.entries()) {
        leaderboardString += `**#${i + 1}** <@${user.userId}> **→** **\`${user.count}\`**\n`;
    }

    return { embeds: [infoEmbed.setTitle(`> 💛 3pT quote authors leaderboard:`).setDescription(leaderboardString)] };
}
