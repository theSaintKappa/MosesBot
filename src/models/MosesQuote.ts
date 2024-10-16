import type { DocumentTimestamps } from "@/types";
import type { Snowflake } from "discord.js";
import { type Document, Schema, model } from "mongoose";

export interface IMosesQuote extends Document, DocumentTimestamps {
    id: number;
    content: string;
    submitterId: Snowflake;
    _deleting?: boolean;
}

const schema = new Schema<IMosesQuote>(
    {
        id: { type: Number, required: true, unique: true },
        content: { type: String, required: true },
        submitterId: { type: String, required: true },
        _deleting: { type: Boolean },
    },
    { timestamps: true, versionKey: false },
);

export const MosesQuote = model<IMosesQuote>("moses.quotes", schema, "moses.quotes");
