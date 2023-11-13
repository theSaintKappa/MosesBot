import type { Date } from "mongoose";

export interface DocumentTimestamps {
    createdAt: Date;
    updatedAt: Date;
}
