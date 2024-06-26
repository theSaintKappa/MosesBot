import { Schema, model } from "mongoose";
import type { IMosesQuoteQueue } from "../../../db";
import MosesQuote from "../../moses/quote.schema";

const schema = new Schema<IMosesQuoteQueue>(
    {
        quoteReference: { type: Schema.Types.ObjectId, ref: MosesQuote.modelName, required: true },
        submitterId: { type: String, required: true },
    },
    { timestamps: true, versionKey: false },
);

export default model<IMosesQuoteQueue>("bot.moses.quoteQueue", schema, "bot.moses.quoteQueue");
