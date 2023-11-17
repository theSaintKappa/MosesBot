import { Schema, model } from "mongoose";
import { IMosesPicUploader } from "../../db/types";

const schema = new Schema<IMosesPicUploader>(
    {
        userId: { type: String, required: true, unique: true },
        adminId: { type: String, required: true },
    },
    { timestamps: true, versionKey: false }
);

export default model<IMosesPicUploader>("moses.pics.uploaders", schema, "moses.pics.uploaders");
