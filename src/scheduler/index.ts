import { CronJob } from "cron";
import { Client, ColorResolvable, EmbedBuilder } from "discord.js";
import config from "../config.json";
import { IMosesPic, IMosesQuote } from "../db/types";
import MosesPic from "../models/moses/pics.schema";
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

export async function getRandomPic() {
    const pic = await MosesPic.aggregate<IMosesPic>([{ $sample: { size: 1 } }]).then((pic) => pic[0]);
    return pic;
}

export function scheduleJobs(client: Client) {
    new CronJob("0 7 * * *", async () => await sendQuote(client), null, true, "Europe/Warsaw");
}

export function getQuoteEmbed(quote: IMosesQuote, pic: IMosesPic) {
    return new EmbedBuilder()
        .setColor(colors[new Date().getDay()])
        .setTitle(`**\`#${quote.id}\`** ${quote.content}`)
        .setDescription(`\u200B\nUploaded by <@${quote.submitterId}> on <t:${Math.floor(quote.createdAt.getTime() / 1000)}:d>`)
        .setThumbnail(pic.url);
}

export async function sendQuote(client: Client, quote?: IMosesQuote, pic?: IMosesPic) {
    quote ??= await getRandomQuote();
    pic ??= await getRandomPic();

    const channel = client.channels.cache.get(config.channels.quotes) as SendableChannel;
    const message = await channel.send({
        embeds: [getQuoteEmbed(quote, pic)],
        content: `${getRandomValue(greetings)}${getRandomValue(faces)} <@&${config.roles.mosesEnjoyer}>, ${getRandomValue(messages)}`,
    });
    message.react(client.emojis.cache.get(config.emojis.upvote) ?? "👍");
    message.react(client.emojis.cache.get(config.emojis.downvote) ?? "👎");
}
