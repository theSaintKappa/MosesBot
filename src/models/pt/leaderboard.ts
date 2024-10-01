import type { DocumentTimestamps } from "@/types";
import type { Snowflake } from "discord.js";
import { type Document, Schema, model } from "mongoose";

export interface IPtLeaderboard extends Document, DocumentTimestamps {
    userId: Snowflake;
    count: number;
}

const schema = new Schema<IPtLeaderboard>(
    {
        userId: { type: String, required: true },
        count: { type: Number, required: true },
    },
    { timestamps: true, versionKey: false },
);

export const PtLeaderboard = model<IPtLeaderboard>("pt.leaderboard", schema, "pt.leaderboard");
