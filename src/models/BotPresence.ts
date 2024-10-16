import type { DocumentTimestamps } from "@/types";
import type { ActivityType, ClientPresenceStatus } from "discord.js";
import { type Document, Schema, model } from "mongoose";

export interface IBotPresence extends Document, DocumentTimestamps {
    type: ActivityType;
    name: string;
    status: ClientPresenceStatus;
}

const schema = new Schema<IBotPresence>(
    {
        type: { type: Number, required: true },
        name: { type: String, required: true },
        status: { type: String, required: true },
    },
    { timestamps: true, versionKey: false },
);

export const BotPresence = model<IBotPresence>("bot.presence", schema, "bot.presence");
