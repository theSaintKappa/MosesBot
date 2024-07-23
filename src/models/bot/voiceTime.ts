import type { IVoiceTime } from "@/db";
import { Schema, model } from "mongoose";

const schema = new Schema<IVoiceTime>(
    {
        userId: { type: String, required: true },
        time: { type: Number, required: true },
    },
    { timestamps: true, versionKey: false },
);

export default model<IVoiceTime>("bot.voiceTime", schema, "bot.voiceTime");
