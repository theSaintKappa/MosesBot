import { ActivityType, ClientPresenceStatus } from "discord.js";
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

export interface IMosesPic extends Document, DocumentTimestamps {
    id: string;
    url: string;
    submitterId: string;
    name: string;
    size: number;
    dimensions: { width: number; height: number };
    contentType: string;
}

export interface IMosesPicUploader extends Document, DocumentTimestamps {
    userId: string;
    adminId: string;
}

export interface IPresence extends Document, DocumentTimestamps {
    type: ActivityType;
    name: string;
    status: ClientPresenceStatus;
}

export interface SchemaWithMetadata<T> {
    metadata: { totalDocuments: number }[];
    data: T;
}
