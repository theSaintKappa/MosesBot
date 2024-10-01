import { type Document, Schema, model } from "mongoose";

export interface ICounter extends Document {
    namespace: {
        db: string;
        coll: string;
    };
    sequence: number;
}

const schema = new Schema<ICounter>({
    namespace: {
        db: { type: String, required: true },
        coll: { type: String, required: true },
    },
    sequence: { type: Number, default: 0 },
});

export const Counter = model<ICounter>("db.counter", schema, "db.counter");
