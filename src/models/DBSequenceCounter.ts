import { type Document, Schema, model } from "mongoose";

export interface IDBSequenceCounter extends Document {
    namespace: {
        db: string;
        coll: string;
    };
    sequence: number;
}

const schema = new Schema<IDBSequenceCounter>({
    namespace: {
        db: { type: String, required: true },
        coll: { type: String, required: true },
    },
    sequence: { type: Number, default: 0 },
});

export const DBSequenceCounter = model<IDBSequenceCounter>("db.sequenceCounter", schema, "db.sequenceCounter");
