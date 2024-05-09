import { Schema, model } from "mongoose";
import type { IMosesLastSentQuote } from "../../../db";
import MosesQuote from "../../moses/quote.schema";

const schema = new Schema<IMosesLastSentQuote>(
    {
        quoteReference: { type: Schema.Types.ObjectId, ref: MosesQuote.modelName, required: true },
    },
    { timestamps: true, versionKey: false },
);

export default model<IMosesLastSentQuote>("bot.moses.lastSentQuote", schema, "bot.moses.lastSentQuote");
