import { ActivityType, ClientPresenceStatus, Snowflake } from "discord.js";
import { Document } from "mongoose";

export interface DocumentTimestamps {
    createdAt: Date;
    updatedAt: Date;
}

interface IQuote extends Document, DocumentTimestamps {
    id: number;
    content: string;
    submitterId: Snowflake;
}

export interface IMosesQuote extends IQuote {}

export interface IPtQuote extends IQuote {
    authorId: Snowflake;
}

export interface ILeaderboard extends Document, DocumentTimestamps {
    userId: Snowflake;
    count: number;
}

export interface IMosesPic extends Document, DocumentTimestamps {
    id: string;
    url: string;
    submitterId: Snowflake;
    name: string;
    size: number;
    dimensions: { width: number; height: number };
    contentType: string;
}

export interface IMosesPicUploader extends Document, DocumentTimestamps {
    userId: Snowflake;
    adminId: Snowflake;
}

export interface IPresence extends Document, DocumentTimestamps {
    type: ActivityType;
    name: string;
    status: ClientPresenceStatus;
}

export interface IVoiceTime extends Document, DocumentTimestamps {
    userId: string;
    time: number;
}

export interface SchemaWithMetadata<T> {
    metadata: { totalDocuments: number }[];
    data: T;
}
