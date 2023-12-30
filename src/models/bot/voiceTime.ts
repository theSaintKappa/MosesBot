import { Schema, model } from "mongoose";
import { IVoiceTime } from "../../db";

const schema = new Schema<IVoiceTime>(
    {
        userId: { type: String, required: true },
        time: { type: Number, required: true },
    },
    { timestamps: true, versionKey: false }
);

export default model<IVoiceTime>("bot.voiceTime", schema, "bot.voiceTime");
