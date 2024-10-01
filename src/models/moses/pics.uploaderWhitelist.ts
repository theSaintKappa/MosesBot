import type { DocumentTimestamps } from "@/types";
import type { Snowflake } from "discord.js";
import { type Document, Schema, model } from "mongoose";

export interface IMosesPicUploader extends Document, DocumentTimestamps {
    userId: Snowflake;
    adminId: Snowflake;
}

const schema = new Schema<IMosesPicUploader>(
    {
        userId: { type: String, required: true, unique: true },
        adminId: { type: String, required: true },
    },
    { timestamps: true, versionKey: false },
);

export const MosesPicUploader = model<IMosesPicUploader>("moses.pics.uploaderWhitelist", schema, "moses.pics.uploaderWhitelist");
