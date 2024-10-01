import type { DocumentTimestamps } from "@/types";
import type { Snowflake } from "discord.js";
import { type Document, Schema, model } from "mongoose";

export interface IMosesLeaderboard extends Document, DocumentTimestamps {
    userId: Snowflake;
    count: number;
}

const schema = new Schema<IMosesLeaderboard>(
    {
        userId: { type: String, required: true },
        count: { type: Number, required: true },
    },
    { timestamps: true, versionKey: false },
);

export const MosesLeaderboard = model<IMosesLeaderboard>("moses.leaderboard", schema, "moses.leaderboard");
