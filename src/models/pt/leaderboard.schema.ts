import { Schema, model } from "mongoose";
import { ILeaderboard } from "../../db/types";

const schema = new Schema<ILeaderboard>(
    {
        userId: { type: String, required: true },
        count: { type: Number, required: true },
    },
    { timestamps: true, versionKey: false }
);

export default model<ILeaderboard>("pt.leaderboard", schema, "pt.leaderboard");
