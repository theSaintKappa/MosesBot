import { ClientPresenceStatus } from "discord.js";
import { Document, Schema, model } from "mongoose";
import { DocumentTimestamps } from "../../db/types";

export interface IPresence extends Document, DocumentTimestamps {
    type: number;
    name: string;
    status: ClientPresenceStatus;
}

const schema = new Schema<IPresence>(
    {
        type: { type: Number, required: true },
        name: { type: String, required: true },
        status: { type: String, required: true },
    },
    { timestamps: true, versionKey: false }
);

export default model<IPresence>("bot.presence", schema, "bot.presence");
