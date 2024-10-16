import type { DocumentTimestamps } from "@/types";
import type { Snowflake } from "discord.js";
import { type Document, Schema, model } from "mongoose";

export interface IPtQuoteLeaderboard extends Document, DocumentTimestamps {
    userId: Snowflake;
    count: number;
}

const schema = new Schema<IPtQuoteLeaderboard>(
    {
        userId: { type: String, required: true },
        count: { type: Number, required: true },
    },
    { timestamps: true, versionKey: false },
);

export const PtQuoteLeaderboard = model<IPtQuoteLeaderboard>("pt.quotesLeaderboard", schema, "pt.quotesLeaderboard");
