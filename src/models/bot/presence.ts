import type { DocumentTimestamps } from "@/types";
import type { ActivityType, ClientPresenceStatus } from "discord.js";
import { type Document, Schema, model } from "mongoose";

export interface IPresence extends Document, DocumentTimestamps {
    type: ActivityType;
    name: string;
    status: ClientPresenceStatus;
}

const schema = new Schema<IPresence>(
    {
        type: { type: Number, required: true },
        name: { type: String, required: true },
        status: { type: String, required: true },
    },
    { timestamps: true, versionKey: false },
);

export const Presence = model<IPresence>("bot.presence", schema, "bot.presence");
