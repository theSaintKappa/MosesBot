import type { IMosesLastSentQuote } from "@/db";
import MosesQuote from "@/models/moses/quote.schema";
import { Schema, model } from "mongoose";

const schema = new Schema<IMosesLastSentQuote>(
    {
        quoteReference: { type: Schema.Types.ObjectId, ref: MosesQuote.modelName, required: true },
    },
    { timestamps: true, versionKey: false },
);

export default model<IMosesLastSentQuote>("moses.lastSentQuote", schema, "moses.lastSentQuote");
