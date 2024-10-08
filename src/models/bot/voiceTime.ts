import type { DocumentTimestamps } from "@/types";
import type { Snowflake } from "discord.js";
import { type Document, Schema, model } from "mongoose";

export interface IVoiceTime extends Document, DocumentTimestamps {
    userId: Snowflake;
    time: number;
}

const schema = new Schema<IVoiceTime>(
    {
        userId: { type: String, required: true },
        time: { type: Number, required: true },
    },
    { timestamps: true, versionKey: false },
);

export const VoiceTime = model<IVoiceTime>("bot.voiceTime", schema, "bot.voiceTime");
