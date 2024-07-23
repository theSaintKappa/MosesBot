import type { IMosesPicUploader } from "@/db";
import { Schema, model } from "mongoose";

const schema = new Schema<IMosesPicUploader>(
    {
        userId: { type: String, required: true, unique: true },
        adminId: { type: String, required: true },
    },
    { timestamps: true, versionKey: false },
);

export default model<IMosesPicUploader>("moses.pics.uploaderWhitelist", schema, "moses.pics.uploaderWhitelist");
