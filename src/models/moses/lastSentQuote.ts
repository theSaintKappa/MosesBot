import { MosesQuote } from "@/models/moses/quote";
import type { DocumentTimestamps } from "@/types";
import { type Document, type ObjectId, Schema, model } from "mongoose";

export interface IMosesLastSentQuote extends Document, DocumentTimestamps {
    quoteReference: ObjectId;
}

const schema = new Schema<IMosesLastSentQuote>(
    {
        quoteReference: { type: Schema.Types.ObjectId, ref: MosesQuote.modelName, required: true },
    },
    { timestamps: true, versionKey: false },
);

export const MosesLastSentQuote = model<IMosesLastSentQuote>("moses.lastSentQuote", schema, "moses.lastSentQuote");
