import { ClientPresenceStatus } from "discord.js";
import { Document } from "mongoose";

export interface DocumentTimestamps {
    createdAt: Date;
    updatedAt: Date;
}

export interface IMosesQuote extends Document, DocumentTimestamps {
    id: number;
    content: string;
    submitterId: string;
}

export interface IPtQuote extends IMosesQuote {
    authorId: string;
}

export interface ILeaderboard extends Document, DocumentTimestamps {
    userId: string;
    count: number;
}

export interface IPresence extends Document, DocumentTimestamps {
    type: number;
    name: string;
    status: ClientPresenceStatus;
}

export interface SchemaWithMetadata<T> {
    metadata: { totalDocuments: number }[];
    data: T;
}
