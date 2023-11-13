import { connect } from "mongoose";

const connectionStr = process.env.MONGODB_URI;

if (!connectionStr) throw new Error("No MongoDB connection string provided. Set MONGODB_URI environment variable.");

connect(connectionStr, { dbName: "MosesDB" }).then(() => console.log("🥭 Connected to MongoDB"));
