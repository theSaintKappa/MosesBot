import type { Snowflake } from "discord.js";
import { type Document, Schema, model } from "mongoose";

const actions = ["image_upload", "moses_quote_add", "pt_quote_add", "presence_change"] as const;

export interface ICockpitLog extends Document {
    action: (typeof actions)[number];
    invokerId: Snowflake;
    metadata: { [key: string]: unknown };
    createdAt: Date;
}

const schema = new Schema<ICockpitLog>(
    {
        action: { type: String, required: true },
        invokerId: { type: String, required: true },
        metadata: { type: Schema.Types.Mixed, required: true },
        createdAt: { type: Date, default: Date.now },
    },
    { timestamps: false, versionKey: false },
);

export const CockpitLog = model<ICockpitLog>("cockpit.logs", schema, "cockpit.logs");
