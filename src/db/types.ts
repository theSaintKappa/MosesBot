import type { Date } from "mongoose";

export interface DocumentTimestamps {
    createdAt: Date;
    updatedAt: Date;
}

export interface SchemaWithMetadata<T> {
    metadata: { totalDocuments: number }[];
    data: T;
}
