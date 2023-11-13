import { Schema, model } from "mongoose";
import { IPresence } from "../../db/types";

const schema = new Schema<IPresence>(
    {
        type: { type: Number, required: true },
        name: { type: String, required: true },
        status: { type: String, required: true },
    },
    { timestamps: true, versionKey: false }
);

export default model<IPresence>("bot.presence", schema, "bot.presence");
