import { Document, Schema, model } from "mongoose";
import { DocumentTimestamps } from "../../db/types";

export interface ILeaderboard extends Document, DocumentTimestamps {
    userId: string;
    count: number;
}

const schema = new Schema<ILeaderboard>(
    {
        userId: { type: String, required: true },
        count: { type: Number, required: true },
    },
    { timestamps: true, versionKey: false }
);

export default model<ILeaderboard>("moses.leaderboard", schema, "moses.leaderboard");
