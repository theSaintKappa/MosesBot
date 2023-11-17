import { CronJob } from "cron";
import { Client, ColorResolvable, EmbedBuilder } from "discord.js";
import { IMosesQuote } from "../db/types";
import MosesQuote from "../models/moses/quote.schema";
import secrets from "../secrets";

const colors: ColorResolvable[] = ["#ff66ff", "#ff5e5e", "#ffa35d", "#fff75d", "#7dff5d", "#61ddff", "#bd6dff"];
const greetings = ["Hi", "Hello", "Hey", "Hellow", "Hi there", "Hello there", "Hey there", "Hellow there"];
const faces = ["", " :3"];
const messages = ["here is a random Moses quote for today!", "here is today's random Moses quote!", "here comes today's random Moses quote!"];

function getRandomValue<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)];
}

export default function scheduleJobs(client: Client) {
    new CronJob(
        "0 7 * * *",
        async () => {
            const quote: IMosesQuote = await MosesQuote.aggregate<IMosesQuote>([{ $sample: { size: 1 } }]).then((quote) => quote[0]);

            const embed = new EmbedBuilder()
                .setColor(colors[new Date().getDay()])
                .setTitle(`**\`#${quote.id}\`** ${quote.content}`)
                .setDescription(`\u200B\nUploaded by <@${quote.submitterId}> on <t:${Math.floor(quote.createdAt.getTime() / 1000)}:d>`);

            const channel = client.channels.cache.get("980813191556780064") as SendableChannel;
            const message = await channel.send({ embeds: [embed], content: `${getRandomValue(greetings)}${getRandomValue(faces)} <@&980815178813820988>, ${getRandomValue(messages)}` });
            message.react("<:upvote:982630993997496321>");
            message.react("<:downvote:982630978566639616>");

            const moses = [..."Moses"].sort(() => 0.5 - Math.random());
            client.guilds.cache.get(secrets.testGuildId)?.members.cache.get("389021335285661707")?.setNickname(moses.join(""));
        },
        null,
        true,
        "Europe/Warsaw"
    );
}
