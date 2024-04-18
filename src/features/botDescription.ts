import type { Client } from "discord.js";
import type { IMosesQuote } from "../db";
import { getLastSentQuote, getRandomQuote } from "./scheduler";

export async function updateBotDescriptionQuote(client: Client, quote?: IMosesQuote) {
    const targetQuote = quote ?? (await getLastSentQuote()) ?? (await getRandomQuote());

    client.application?.edit({ description: `*${targetQuote?.content}*\n\nMade with :heart: by SaintKappa` });
}
