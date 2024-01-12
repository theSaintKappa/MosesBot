import { ActivityType, ClientPresenceStatus, Snowflake } from "discord.js";
import { Document, MongooseError, ObjectId, connect } from "mongoose";
import secrets from "./utils/secrets";

export const connectMongo = async () => {
    console.log("╔ 🥭 \x1b[33mConnecting to MongoDB...\x1b[0m");

    await connect(secrets.mongoUri, { dbName: "MosesDB", serverSelectionTimeoutMS: 5000 })
        .then(() => console.log("╚ ☑️  \x1b[35mConnected to MongoDB!\x1b[0m"))
        .catch((err: MongooseError) => {
            console.error("╚ ❌ Failed to connect to MongoDB!", err.message);
            process.exit(1);
        });
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
    userId: Snowflake;
    time: number;
}
