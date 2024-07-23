import type { IMosesQuoteQueue } from "@/db";
import MosesQuote from "@/models/moses/quote.schema";
import { Schema, model } from "mongoose";

const schema = new Schema<IMosesQuoteQueue>(
    {
        quoteReference: { type: Schema.Types.ObjectId, ref: MosesQuote.modelName, required: true },
        submitterId: { type: String, required: true },
    },
    { timestamps: true, versionKey: false },
);

export default model<IMosesQuoteQueue>("moses.quoteQueue", schema, "moses.quoteQueue");
