import type { NewsChannel, TextChannel } from "discord.js";

export interface DocumentTimestamps {
    createdAt: Date;
    updatedAt: Date;
}

export type SendableChannel = TextChannel | NewsChannel;
