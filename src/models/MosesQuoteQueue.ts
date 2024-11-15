import { MosesQuote } from "@/models/MosesQuote";
import type { DocumentTimestamps } from "@/types";
import type { Snowflake } from "discord.js";
import { type Document, type ObjectId, Schema, model } from "mongoose";

export interface IMosesQuoteQueue extends Document, DocumentTimestamps {
    quote?: typeof MosesQuote;
    quoteId: ObjectId;
    submitterId: Snowflake;
}

const schema = new Schema<IMosesQuoteQueue>(
    {
        quoteId: { type: Schema.Types.ObjectId, ref: MosesQuote.modelName, required: true },
        submitterId: { type: String, required: true },
    },
    { timestamps: true, versionKey: false },
);

schema.virtual("quote", { ref: MosesQuote.modelName, localField: "quoteId", foreignField: "_id", justOne: true });
schema.set("toObject", { virtuals: true });
schema.set("toJSON", { virtuals: true });

export const MosesQuoteQueue = model<IMosesQuoteQueue>("moses.quotesQueue", schema, "moses.quotesQueue");
