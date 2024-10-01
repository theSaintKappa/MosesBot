import type { DocumentTimestamps } from "@/types";
import type { Snowflake } from "discord.js";
import { type Document, Schema, model } from "mongoose";

export interface IMosesPic extends Document, DocumentTimestamps {
    id: string;
    url: string;
    submitterId: Snowflake;
    size: number;
    dimensions: { width: number; height: number };
    contentType: string;
}

const schema = new Schema<IMosesPic>(
    {
        id: { type: String, required: true, unique: true },
        url: { type: String, required: true },
        submitterId: { type: String, required: true },
        size: { type: Number, required: true },
        dimensions: {
            width: { type: Number, required: true },
            height: { type: Number, required: true },
        },
        contentType: { type: String, required: true },
    },
    { timestamps: true, versionKey: false },
);

export const MosesPic = model<IMosesPic>("moses.pics", schema, "moses.pics");
