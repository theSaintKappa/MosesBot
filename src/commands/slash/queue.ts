import { CommandScope, type SlashCommandObject } from "@/commands/types";
import config from "@/config.json";
import type { IMosesQuote, IMosesQuoteQueue } from "@/db";
import { getNextCronDates } from "@/features/scheduler";
import MosesQuote from "@/models/moses/quote.schema";
import MosesQuoteQueue from "@/models/moses/quoteQueue.schema";
import { getRecentQuotesAutocomplete } from "@/utils/autocomplete";
import { getErrorReply, getInfoReply, getNoticeReply, getSuccessReply } from "@/utils/replyEmbeds";
import { type InteractionReplyOptions, PermissionFlagsBits, SlashCommandBuilder } from "discord.js";

export default {
    builder: new SlashCommandBuilder()
        .setName("queue")
        .setDescription("Moses quote queue related commands.")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addSubcommand((subcommand) =>
            subcommand
                .setName("add")
                .setDescription("Add a Moses quote to the queue.")
                .addNumberOption((option) => option.setName("id").setDescription("The id of the quote to queue up.").setRequired(true).setAutocomplete(true)),
        )
        .addSubcommand((subcommand) => subcommand.setName("clear").setDescription("Clear the Moses quote queue."))
        .addSubcommand((subcommand) => subcommand.setName("display").setDescription("Display the Moses quote queue.")),

    autocomplete: async (subcommand) => {
        if (subcommand === "add") return await getRecentQuotesAutocomplete();
    },

    scope: CommandScope.Guild,

    run: async (interaction) => {
        const { options, user } = interaction;
        const subcommand = options.getSubcommand();

        switch (subcommand) {
            case "add": {
                const id = options.getNumber("id");
                if (!id) throw new Error("Queue add is missing the id argument.");
                await interaction.reply(await add(id, user.id));
                break;
            }
            case "clear": {
                await interaction.reply(await clear());
                break;
            }
            case "display": {
                await interaction.reply(await display());
                break;
            }
        }
    },
} as SlashCommandObject;

async function add(id: number, submitterId: string): Promise<InteractionReplyOptions> {
    const quote = await MosesQuote.findOne<IMosesQuote>({ id });
    if (!quote) return getErrorReply(`***Quote **\`#${id}\`** does not exist.***`);

    await MosesQuoteQueue.create({ quoteReference: quote._id, submitterId } as IMosesQuoteQueue);

    const queueSize = await MosesQuoteQueue.countDocuments();

    return getSuccessReply(`Quote #${quote.id} added to the queue!`, `### \u201c\n${quote.content.replace(/\\n/, "\n")}\n### \u201d\n-# <#${config.channels.quotes}> <t:${Math.floor(getNextCronDates(queueSize)[queueSize - 1].getTime() / 1000)}:R>`);
}

async function clear(): Promise<InteractionReplyOptions> {
    const { deletedCount } = await MosesQuoteQueue.deleteMany({});

    if (deletedCount === 0) return getNoticeReply("The Moses quote queue is already empty.");

    return getSuccessReply("Queue cleared!", `🧹 **${deletedCount}**${deletedCount > 1 ? " quote(s) have " : " quote has "}been removed from the queue.`);
}

async function display(): Promise<InteractionReplyOptions> {
    const queue = await MosesQuoteQueue.find().sort({ createdAt: 1 }).populate<{ quoteReference: IMosesQuote }>("quoteReference");

    if (queue.length === 0) return getNoticeReply("The Moses quote queue is empty.");

    const nextCronDates = getNextCronDates(queue.length);

    return getInfoReply("Moses quote queue:", queue.map(({ quoteReference }, i) => `<t:${Math.floor(nextCronDates[i].getTime() / 1000)}:R> → #**${quoteReference.id}** **\`${quoteReference.content.replace(/\n/g, " ")}\`**`).join("\n"));
}
