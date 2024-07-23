import type { IPtQuote } from "@/db";
import { Schema, model } from "mongoose";

const schema = new Schema<IPtQuote>(
    {
        id: { type: Number, required: true, unique: true },
        content: { type: String, required: true },
        authorId: { type: String, required: true },
        submitterId: { type: String, required: true },
    },
    { timestamps: true, versionKey: false },
);

export default model<IPtQuote>("pt.quotes", schema, "pt.quotes");
