import config from "@/config.json";
import { updateBotDescriptionQuote } from "@/features/botDescription";
import { BotLastRolledQuote } from "@/models/BotLastRolledQuote";
import { type IMosesPic, MosesPic } from "@/models/MosesPic";
import { type IMosesQuote, MosesQuote } from "@/models/MosesQuote";
import { MosesQuoteQueue } from "@/models/MosesQuoteQueue";
import type { SendableChannel } from "@/types";
import { logger } from "@/utils/logger";
import { CronJob } from "cron";
import { type Client, type ColorResolvable, EmbedBuilder } from "discord.js";

const log = logger("Scheduler");

const colors: ColorResolvable[] = ["#ff66ff", "#ff5e5e", "#ffa35d", "#fff75d", "#7dff5d", "#61ddff", "#bd6dff"];
const greetings = ["Hi", "Hello", "Hey", "Hellow", "Hi there", "Hello there", "Hey there", "Hellow there"];
const faces = ["", " :3"];
const messages = ["here is a random Moses quote for today!", "here is today's random Moses quote!", "here comes today's random Moses quote!"];

let cronJob: CronJob;

function getRandomValue<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)];
}

export async function getRandomQuote() {
    const quote: IMosesQuote = await MosesQuote.aggregate<IMosesQuote>([{ $sample: { size: 1 } }]).then((quote) => quote[0]);
    return quote;
}

export async function getRandomPic() {
    const pic = await MosesPic.aggregate<IMosesPic>([{ $sample: { size: 1 } }]).then((pic) => pic[0]);
    return pic;
}

export function scheduleJobs(client: Client) {
    cronJob = new CronJob("0 7 * * *", async () => await sendQuote(client), null, true, "Europe/Warsaw");
    log("⌚ Quote Cron Job has been scheduled!");
}

export function getNextCronDates(n?: number) {
    return cronJob.nextDates(n ?? 1).map((dateTime) => dateTime.toJSDate());
}

export function getQuoteEmbed(quote: IMosesQuote, pic: IMosesPic) {
    return new EmbedBuilder()
        .setColor(colors[new Date().getDay()])
        .setDescription(`### \u201c\n${quote.content.replace(/\\n/g, "\n")}\n### \u201d\n\u200B\n-# **\`\#${quote.id}\`** · Uploaded by <@${quote.submitterId}> on <t:${Math.floor(quote.createdAt.getTime() / 1000)}:d>`)
        .setThumbnail(pic.url);
}

export async function sendQuote(client: Client, quote?: IMosesQuote, pic?: IMosesPic) {
    const queueEntry = await MosesQuoteQueue.findOne().sort({ createdAt: 1 }).populate<{ quoteReference: IMosesQuote }>("quoteReference");

    if (!quote && queueEntry) await queueEntry.deleteOne();

    const selectedQuote = quote ?? queueEntry?.quoteReference ?? (await getRandomQuote());
    const selectedPic = pic ?? (await getRandomPic());

    const channel = client.channels.cache.get(config.channels.quotes) as SendableChannel;
    const message = await channel.send({
        embeds: [getQuoteEmbed(selectedQuote, selectedPic)],
        content: `${getRandomValue(greetings)}${getRandomValue(faces)} <@&${config.roles.mosesEnjoyer}>, ${getRandomValue(messages)} ${queueEntry ? "*(from queue)*" : ""}`,
    });
    message.react(client.emojis.cache.get(config.emojis.upvote) ?? "👍");
    message.react(client.emojis.cache.get(config.emojis.downvote) ?? "👎");

    updateLastSentQuote(selectedQuote);

    updateBotDescriptionQuote(client, selectedQuote);

    await queueEntry?.deleteOne();
}

export async function updateLastSentQuote(quote: IMosesQuote) {
    await BotLastRolledQuote.findOneAndUpdate({}, { quoteReference: quote._id }, { upsert: true });
}

export async function getLastSentQuote() {
    const quote = await BotLastRolledQuote.findOne().populate<{ quoteReference: IMosesQuote }>("quoteReference");
    return quote?.quoteReference ?? null;
}
