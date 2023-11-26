import { CronJob } from "cron";
import { Client, ColorResolvable, EmbedBuilder } from "discord.js";
import config from "../config.json";
import { IMosesQuote } from "../db/types";
import MosesQuote from "../models/moses/quote.schema";

const colors: ColorResolvable[] = ["#ff66ff", "#ff5e5e", "#ffa35d", "#fff75d", "#7dff5d", "#61ddff", "#bd6dff"];
const greetings = ["Hi", "Hello", "Hey", "Hellow", "Hi there", "Hello there", "Hey there", "Hellow there"];
const faces = ["", " :3"];
const messages = ["here is a random Moses quote for today!", "here is today's random Moses quote!", "here comes today's random Moses quote!"];

function getRandomValue<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)];
}

export async function getRandomQuote() {
    const quote: IMosesQuote = await MosesQuote.aggregate<IMosesQuote>([{ $sample: { size: 1 } }]).then((quote) => quote[0]);
    return quote;
}

export function scheduleJobs(client: Client) {
    new CronJob("0 7 * * *", async () => await sendQuote(client), null, true, "Europe/Warsaw");
}

export function getQuoteEmbed(quote: IMosesQuote) {
    return new EmbedBuilder()
        .setColor(colors[new Date().getDay()])
        .setTitle(`**\`#${quote.id}\`** ${quote.content}`)
        .setDescription(`\u200B\nUploaded by <@${quote.submitterId}> on <t:${Math.floor(quote.createdAt.getTime() / 1000)}:d>`);
}

export async function sendQuote(client: Client, quote?: IMosesQuote) {
    quote ??= await getRandomQuote();

    const channel = client.channels.cache.get(config.channels.quotes) as SendableChannel;
    const message = await channel.send({ embeds: [getQuoteEmbed(quote)], content: `${getRandomValue(greetings)}${getRandomValue(faces)} <@&980815178813820988>, ${getRandomValue(messages)}` });
    message.react(client.emojis.cache.get(config.emojis.upvote) ?? "👍");
    message.react(client.emojis.cache.get(config.emojis.downvote) ?? "👎");
}
