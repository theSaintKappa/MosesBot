import type { DocumentTimestamps } from "@/types";
import type { Snowflake } from "discord.js";
import { type Document, Schema, model } from "mongoose";

export interface IPTQuote extends Document, DocumentTimestamps {
    id: number;
    content: string;
    authorId: Snowflake;
    submitterId: Snowflake;
    _deleting?: boolean;
}

const schema = new Schema<IPTQuote>(
    {
        id: { type: Number, required: true, unique: true },
        content: { type: String, required: true },
        authorId: { type: String, required: true },
        submitterId: { type: String, required: true },
        _deleting: { type: Boolean },
    },
    { timestamps: true, versionKey: false },
);

export const PTQuote = model<IPTQuote>("pt.quotes", schema, "pt.quotes");
