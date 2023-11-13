import { Document, Schema, model } from "mongoose";
import { DocumentTimestamps } from "../../db/types";

export interface IQuote extends Document, DocumentTimestamps {
    id: number;
    content: string;
    submitterId: string;
}

const schema = new Schema<IQuote>(
    {
        id: { type: Number, required: true, unique: true },
        content: { type: String, required: true },
        submitterId: { type: String, required: true },
    },
    { timestamps: true, versionKey: false }
);

export default model<IQuote>("moses.quotes", schema);
