import { CronJob } from "cron";
import { type Client, type ColorResolvable, EmbedBuilder } from "discord.js";
import config from "../config.json";
import type { IMosesLastSentQuote, IMosesPic, IMosesQuote } from "../db";
import MosesPic from "../models/moses/pics.schema";
import MosesQuote from "../models/moses/quote.schema";
import MosesQuoteQueue from "../models/moses/quoteQueue.schema";
import MosesLastSentQuote from "../models/moses/lastSentQuote.schema";
import { updateBotDescriptionQuote } from "./botDescription";

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
    console.log("═ ☑️  \x1b[35mQuote Cron Job has been scheduled!\x1b[0m");
}

export function getNextCronDates(n?: number) {
    return cronJob.nextDates(n ?? 1).map((dateTime) => dateTime.toJSDate());
}

export function getQuoteEmbed(quote: IMosesQuote, pic: IMosesPic) {
    return new EmbedBuilder()
        .setColor(colors[new Date().getDay()])
        .setTitle(`**\`#${quote.id}\`** ${quote.content}`)
        .setDescription(`\u200B\nUploaded by <@${quote.submitterId}> on <t:${Math.floor(quote.createdAt.getTime() / 1000)}:d>`)
        .setThumbnail(pic.url);
}

export async function sendQuote(client: Client, quote?: IMosesQuote, pic?: IMosesPic) {
    const queue = await MosesQuoteQueue.findOne().sort({ createdAt: 1 }).populate<{ quoteReference: IMosesQuote }>("quoteReference");

    const selectedQuote = quote ?? queue?.quoteReference ?? (await getRandomQuote());
    const selectedPic = pic ?? (await getRandomPic());

    const channel = client.channels.cache.get(config.channels.quotes) as SendableChannel;
    const message = await channel.send({
        embeds: [getQuoteEmbed(selectedQuote, selectedPic)],
        content: `${getRandomValue(greetings)}${getRandomValue(faces)} <@&${config.roles.mosesEnjoyer}>, ${getRandomValue(messages)} ${queue ? "*(from queue)*" : ""}`,
    });
    message.react(client.emojis.cache.get(config.emojis.upvote) ?? "👍");
    message.react(client.emojis.cache.get(config.emojis.downvote) ?? "👎");

    queue?.deleteOne();

    updateLastSentQuote(selectedQuote);

    updateBotDescriptionQuote(client, selectedQuote);
}

export async function updateLastSentQuote(quote: IMosesQuote) {
    await MosesLastSentQuote.findOneAndUpdate({}, { quoteReference: quote._id } as IMosesLastSentQuote, { upsert: true });
}

export async function getLastSentQuote() {
    const quote = await MosesLastSentQuote.findOne().populate<{ quoteReference: IMosesQuote }>("quoteReference");
    return quote?.quoteReference ?? null;
}
