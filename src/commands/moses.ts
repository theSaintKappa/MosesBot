import { CommandInteractionOptionResolver, EmbedBuilder, InteractionReplyOptions, PermissionsBitField, SlashCommandBuilder, User } from "discord.js";
import { ILeaderboard, IMosesQuote, SchemaWithMetadata } from "../db/types";
import MosesLeaderboard from "../models/moses/leaderboard.schema";
import MosesQuote from "../models/moses/quote.schema";
import { CommandObject, CommandType } from "./types";

export default {
    builder: new SlashCommandBuilder()
        .setName("moses")
        .setDescription("All Moses quotes related commands.")
        .addSubcommand((subcommand) =>
            subcommand
                .setName("list")
                .setDescription("List all stored Moses quotes.")
                .addNumberOption((option) => option.setName("page").setDescription("The page of quotes you would like to see (every page has 15 quotes in it).").setRequired(false))
        )
        .addSubcommand((subcommand) =>
            subcommand
                .setName("add")
                .setDescription("Add a new Moses quote.")
                .addStringOption((option) => option.setName("quote").setDescription("The quote to add.").setRequired(true))
        )
        .addSubcommand((subcommand) =>
            subcommand
                .setName("edit")
                .setDescription("Edit an existing Moses quote.")
                .addNumberOption((option) => option.setName("id").setDescription("The id of the quote you would like to edit. To check quote id's, run: /moses list <page>.").setRequired(true))
                .addStringOption((option) => option.setName("quote").setDescription("The new quote.").setRequired(true))
        )
        .addSubcommand((subcommand) =>
            subcommand
                .setName("delete")
                .setDescription("Delete a Moses quote.")
                .addNumberOption((option) => option.setName("id").setDescription("The id of the quote you would like to delete. To check quote id's, run: /moses list <page>.").setRequired(true))
        )
        .addSubcommand((subcommand) => subcommand.setName("leaderboard").setDescription("Check the Moses quote adders leaderboard.")),

    type: CommandType.Guild,

    run: async (interaction) => {
        const subcommand = interaction.options.data[0].name;
        const args = <CommandInteractionOptionResolver>interaction.options;

        switch (subcommand) {
            case "list":
                await interaction.reply(await list(args.getNumber("page") ?? 1));
                break;
            case "add":
                await interaction.reply(await add(args.getString("quote")!!, interaction.user));
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
} as CommandObject;

const infoEmbed = new EmbedBuilder().setColor("#00c8ff").setFooter({ text: "Moses quotes" });
const successEmbed = new EmbedBuilder().setColor("#00ff3c").setFooter({ text: "Moses quotes" });
const errorEmbed = new EmbedBuilder().setColor("#ff0000");

async function list(page: number): Promise<InteractionReplyOptions> {
    const pageSize = 15;

    if (page < 1) return { embeds: [errorEmbed.setTitle("Page number must be greater than 0.")], ephemeral: true };

    const quotesWithMetadata = await MosesQuote.aggregate<SchemaWithMetadata<IMosesQuote[]>>([
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

    if (totalQuotes === 0) return { embeds: [errorEmbed.setDescription("❌ There are no Moses quotes stored in the database.")], ephemeral: true };
    if (page > validPages)
        return {
            embeds: [errorEmbed.setDescription(validPages == 1 ? `❌ There is only 1 page of quotes available.` : `❌ There are only ${validPages} pages of quotes available.`)],
            ephemeral: true,
        };

    let quotesString = "";
    for (const quote of quotes) {
        quotesString += `**#${quote.id}** \`${quote.content}\`\n`;
    }

    return { embeds: [infoEmbed.setTitle(`> 💛 Moses quotes *(page ${page} of ${validPages})*:`).setDescription(quotesString)] };
}

async function add(quote: string, user: User): Promise<InteractionReplyOptions> {
    if (!quote.endsWith(".") && !quote.endsWith("?") && !quote.endsWith("!")) quote += ".";
    await MosesQuote.create({ id: 0, content: quote, submitterId: user.id });

    return { embeds: [successEmbed.setTitle(`> ✅ Quote added!`).setDescription(`**\`${quote}\`**`)] };
}

async function edit(id: number, newQuote: string, memberPermissions: PermissionsBitField, user: User): Promise<InteractionReplyOptions> {
    const quote = await MosesQuote.findOne({ id });

    if (!quote) return { embeds: [errorEmbed.setDescription(`❌ Quote **\`#${id}\`** does not exist.`)], ephemeral: true };

    if (!newQuote.endsWith(".") && !newQuote.endsWith("?") && !newQuote.endsWith("!")) newQuote += ".";

    if (quote.content === newQuote) return { embeds: [errorEmbed.setDescription(`❌ The new quote cannot be the same as the old one.`)], ephemeral: true };

    if (memberPermissions.has(PermissionsBitField.Flags.Administrator)) {
        await MosesQuote.updateOne({ id }, { content: newQuote });
        return { embeds: [successEmbed.setTitle(`> ✅ Quote edited!`).setDescription(`**from:** **\`${quote.content}\`**\n**to:** **\`${newQuote}\`**\n***(Admin mode)***`)] };
    }

    if (quote.submitterId === user.id) {
        await MosesQuote.updateOne({ id }, { content: newQuote });
        return { embeds: [successEmbed.setTitle(`> ✅ Quote edited!`).setDescription(`**from:** **\`${quote.content}\`**\n**to:** **\`${newQuote}\`**`)] };
    }

    return { embeds: [errorEmbed.setDescription(`❌ Quote **\`#${id}\`** was submitted by <@${quote.submitterId}>.\nIf you want it edited ask them or a server admin.`)], ephemeral: true };
}

async function drop(id: number, memberPermissions: PermissionsBitField, user: User): Promise<InteractionReplyOptions> {
    const quote = await MosesQuote.findOne({ id });

    if (!quote) return { embeds: [errorEmbed.setDescription(`❌ Quote **\`#${id}\`** does not exist.`)], ephemeral: true };

    if (memberPermissions.has(PermissionsBitField.Flags.Administrator)) {
        await MosesQuote.deleteOne({ id });
        return { embeds: [successEmbed.setTitle(`> ✅ Quote deleted!`).setDescription(`**\`${quote.id}\`** **\`${quote.content}\`** has been deleted.\n***(Admin mode)***`)] };
    }

    if (quote.submitterId === user.id) {
        await MosesQuote.deleteOne({ id });
        return { embeds: [successEmbed.setTitle(`> ✅ Quote deleted!`).setDescription(`**\`${quote.id}\`** **\`${quote.content}\`** has been deleted.`)] };
    }

    return { embeds: [errorEmbed.setDescription(`❌ Quote **\`#${id}\`** was submitted by <@${quote.submitterId}>.\nIf you want it edited ask them or a server admin.`)], ephemeral: true };
}

async function leaderboard(): Promise<InteractionReplyOptions> {
    const leaderboard = await MosesLeaderboard.find<ILeaderboard>();

    if (leaderboard.length === 0) return { embeds: [errorEmbed.setDescription("❌ The Moses leaderboard is empty.")], ephemeral: true };

    let leaderboardString = "";
    for (let [i, user] of leaderboard.entries()) {
        leaderboardString += `**#${i + 1}** <@${user.userId}> **→** **\`${user.count}\`**\n`;
    }

    return { embeds: [infoEmbed.setTitle(`> 💛 Moses quote submiters leaderboard:`).setDescription(leaderboardString)] };
}
