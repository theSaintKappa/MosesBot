import type { ActivityType, ClientPresenceStatus, Snowflake } from "discord.js";
import { type Document, type MongooseError, type ObjectId, connect } from "mongoose";
import { logger } from "./utils/logger";
import secrets from "./utils/secrets";

const log = logger("MosesDB");

export const connectMongo = async () => {
    try {
        await connect(secrets.mongoUri, { dbName: "MosesDB", serverSelectionTimeoutMS: 5000 });
        log("🥭 Connected to Mongo!");
    } catch (err) {
        log.error(`Failed to connect to Mongo: ${(<MongooseError>err).message}`);
        process.exit(1);
    }
};

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

export interface IMosesQuoteQueue extends Document, DocumentTimestamps {
    quoteReference: ObjectId;
    submitterId: Snowflake;
}

export interface IMosesLastSentQuote extends Document, DocumentTimestamps {
    quoteReference: ObjectId;
}

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
    userId: Snowflake;
    time: number;
}
