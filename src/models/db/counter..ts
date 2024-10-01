import { type Document, Schema, model } from "mongoose";

export interface ICounter extends Document {
    coll: string;
    sequence: number;
}

const schema = new Schema<ICounter>({
    coll: { type: String, required: true },
    sequence: { type: Number, default: 0 },
});

export const Counter = model<ICounter>("db.counter", schema, "db.counter");
