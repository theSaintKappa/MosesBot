import type { IMosesQuote } from "@/models/MosesQuote";
import { MosesQuote } from "@/models/MosesQuote";
import type { ApplicationCommandOptionChoiceData } from "discord.js";

export async function getRecentQuotesAutocomplete(): Promise<ApplicationCommandOptionChoiceData[]> {
    return MosesQuote.aggregate<IMosesQuote>([{ $sort: { id: -1 } }, { $limit: 25 }]).then((quotes) =>
        quotes.map(({ content, id }) => {
            content = `#${id} → ${content.replace(/\\n/g, " ").replace(/\\/g, "")}`;
            const name = content.length > 100 ? `${content.substring(0, 97)}...` : content;
            return { name, value: id };
        }),
    );
}
