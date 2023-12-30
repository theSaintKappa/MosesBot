import { MongooseError, connect } from "mongoose";
import secrets from "../secrets";

export const connectMongo = async () => {
    console.log("╔ 🥭 \x1b[33mConnecting to MongoDB...\x1b[0m");

    await connect(secrets.mongoUri, { dbName: "MosesDB", serverSelectionTimeoutMS: 5000 })
        .then(() => console.log("╚ ☑️  \x1b[35mConnected to MongoDB!\x1b[0m"))
        .catch((err: MongooseError) => {
            console.error("╚ ❌ Failed to connect to MongoDB!", err.message);
            process.exit(1);
        });
};
