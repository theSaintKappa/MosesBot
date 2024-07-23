import type { ILeaderboard } from "@/db";
import { Schema, model } from "mongoose";

const schema = new Schema<ILeaderboard>(
    {
        userId: { type: String, required: true },
        count: { type: Number, required: true },
    },
    { timestamps: true, versionKey: false },
);

export default model<ILeaderboard>("moses.leaderboard", schema, "moses.leaderboard");
