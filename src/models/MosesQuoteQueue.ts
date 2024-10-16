import { MosesQuote } from "@/models/MosesQuote";
import type { DocumentTimestamps } from "@/types";
import type { Snowflake } from "discord.js";
import { type Document, type ObjectId, Schema, model } from "mongoose";

export interface IMosesQuoteQueue extends Document, DocumentTimestamps {
    quoteReference: ObjectId;
    submitterId: Snowflake;
}

const schema = new Schema<IMosesQuoteQueue>(
    {
        quoteReference: { type: Schema.Types.ObjectId, ref: MosesQuote.modelName, required: true },
        submitterId: { type: String, required: true },
    },
    { timestamps: true, versionKey: false },
);

export const MosesQuoteQueue = model<IMosesQuoteQueue>("moses.quotesQueue", schema, "moses.quotesQueue");
