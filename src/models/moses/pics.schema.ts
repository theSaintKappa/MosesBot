import { Schema, model } from "mongoose";
import type { IMosesPic } from "../../db";

const schema = new Schema<IMosesPic>(
    {
        id: { type: String, required: true, unique: true },
        url: { type: String, required: true },
        submitterId: { type: String, required: true },
        size: { type: Number, required: true },
        dimensions: {
            width: { type: Number, required: true },
            height: { type: Number, required: true },
        },
        contentType: { type: String, required: true },
    },
    { timestamps: true, versionKey: false },
);

export default model<IMosesPic>("moses.pics", schema, "moses.pics");
