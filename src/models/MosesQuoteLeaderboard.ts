import type { DocumentTimestamps } from "@/types";
import type { Snowflake } from "discord.js";
import { type Document, Schema, model } from "mongoose";

export interface IMosesQuoteLeaderboard extends Document, DocumentTimestamps {
    userId: Snowflake;
    count: number;
}

const schema = new Schema<IMosesQuoteLeaderboard>(
    {
        userId: { type: String, required: true },
        count: { type: Number, required: true },
    },
    { timestamps: true, versionKey: false },
);

export const MosesQuoteLeaderboard = model<IMosesQuoteLeaderboard>("moses.quotesLeaderboard", schema, "moses.quotesLeaderboard");
