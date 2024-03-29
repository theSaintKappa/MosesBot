import { Schema, model } from "mongoose";
import type { IPresence } from "../../db";

const schema = new Schema<IPresence>(
    {
        type: { type: Number, required: true },
        name: { type: String, required: true },
        status: { type: String, required: true },
    },
    { timestamps: true, versionKey: false }
);

export default model<IPresence>("bot.presence", schema, "bot.presence");
