import { MosesQuote } from "@/models/MosesQuote";
import type { DocumentTimestamps } from "@/types";
import { type Document, type ObjectId, Schema, model } from "mongoose";

export interface IBotLastRolledQuote extends Document, DocumentTimestamps {
    quoteReference: ObjectId;
}

const schema = new Schema<IBotLastRolledQuote>(
    {
        quoteReference: { type: Schema.Types.ObjectId, ref: MosesQuote.modelName, required: true },
    },
    { timestamps: true, versionKey: false },
);

export const BotLastRolledQuote = model<IBotLastRolledQuote>("bot.lastRolledQuote", schema, "bot.lastRolledQuote");
