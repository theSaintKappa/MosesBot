import { Schema, model } from "mongoose";
import { IMosesQuote } from "../../db/types";

const schema = new Schema<IMosesQuote>(
    {
        id: { type: Number, required: false, unique: true },
        content: { type: String, required: true },
        submitterId: { type: String, required: true },
    },
    { timestamps: true, versionKey: false }
);

export default model<IMosesQuote>("moses.quotes", schema, "moses.quotes");