import { connect } from "mongoose";
import secrets from "../secrets";

connect(secrets.mongoUri, { dbName: "MosesDB" }).then(() => console.log("🥭 Connected to MongoDB"));
