import { getLastSentQuote, getRandomQuote } from "@/features/scheduler";
import type { IMosesQuote } from "@/models/moses/quote";
import type { Client } from "discord.js";

export async function updateBotDescriptionQuote(client: Client, quote?: IMosesQuote) {
    const targetQuote = quote ?? (await getLastSentQuote()) ?? (await getRandomQuote());

    client.application?.edit({ description: `"${targetQuote?.content}"\n\nMade with :heart: by SaintKappa` });
}
