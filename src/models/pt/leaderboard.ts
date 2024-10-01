import type { DocumentTimestamps } from "@/types";
import type { Snowflake } from "discord.js";
import { type Document, Schema, model } from "mongoose";

export interface IPTLeaderboard extends Document, DocumentTimestamps {
    userId: Snowflake;
    count: number;
}

const schema = new Schema<IPTLeaderboard>(
    {
        userId: { type: String, required: true },
        count: { type: Number, required: true },
    },
    { timestamps: true, versionKey: false },
);

export const PTLeaderboard = model<IPTLeaderboard>("pt.leaderboard", schema, "pt.leaderboard");
