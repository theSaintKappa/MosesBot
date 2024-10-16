import type { DocumentTimestamps } from "@/types";
import type { Snowflake } from "discord.js";
import { type Document, Schema, model } from "mongoose";

export interface IBotVoiceTimeLeaderboard extends Document, DocumentTimestamps {
    userId: Snowflake;
    time: number;
}

const schema = new Schema<IBotVoiceTimeLeaderboard>(
    {
        userId: { type: String, required: true },
        time: { type: Number, required: true },
    },
    { timestamps: true, versionKey: false },
);

export const BotVoiceTimeLeaderboard = model<IBotVoiceTimeLeaderboard>("bot.voiceTimeLeaderboard", schema, "bot.voiceTimeLeaderboard");
