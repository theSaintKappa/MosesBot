import { logger } from "@/utils/logger";
import secrets from "@/utils/secrets";
import { type MongooseError, connect } from "mongoose";

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

export const initChangeStream = async () => {};
