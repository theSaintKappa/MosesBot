import { Counter } from "@/models/db/counter";
import { MosesLeaderboard } from "@/models/moses/leaderboard";
import { MosesQuote } from "@/models/moses/quote";
import { PTLeaderboard } from "@/models/pt/leaderboard";
import { PTQuote } from "@/models/pt/quote";
import { logger } from "@/utils/logger";

const log = logger("MosesDB");

export function watchMosesQuotes() {
    log("👁️  Now watching moses.quotes for changes.");
    MosesQuote.watch([{ $match: { $or: [{ operationType: "insert" }, { "updateDescription.updatedFields._deleting": { $exists: true } }] } }], { fullDocument: "updateLookup" }).on("change", async (change) => {
        // TODO: write types for theese change objects

        if (!change.fullDocument._deleting) {
            const updatedCounter = await Counter.findOneAndUpdate({ namespace: change.ns }, { $inc: { sequence: 1 } }, { new: true, upsert: true });

            await MosesQuote.findOneAndUpdate({ _id: change.documentKey._id }, { $set: { id: updatedCounter?.sequence } }, { new: true });

            await MosesLeaderboard.findOneAndUpdate({ userId: change.fullDocument.submitterId }, { $inc: { count: 1 } }, { new: true, upsert: true });
        } else {
            const updatedCounter = await Counter.findOneAndUpdate({ namespace: change.ns }, { $inc: { sequence: -1 } }, { new: true });

            await MosesQuote.deleteOne({ _id: change.documentKey._id });

            await MosesLeaderboard.findOneAndUpdate({ userId: change.fullDocument.submitterId }, { $inc: { count: -1 } }, { new: true });

            if (updatedCounter?.sequence && change.fullDocument.id === updatedCounter?.sequence + 1) return;
            await MosesQuote.updateMany({ id: { $gt: change.fullDocument.id } }, { $inc: { id: -1 } }, { multi: true });
        }
    });
}

export function watchPTQuotes() {
    log("👁️  Now watching pt.quotes for changes.");
    PTQuote.watch([{ $match: { $or: [{ operationType: "insert" }, { "updateDescription.updatedFields._deleting": { $exists: true } }] } }], { fullDocument: "updateLookup" }).on("change", async (change) => {
        if (!change.fullDocument._deleting) {
            const updatedCounter = await Counter.findOneAndUpdate({ namespace: change.ns }, { $inc: { sequence: 1 } }, { new: true, upsert: true });

            await PTQuote.findOneAndUpdate({ _id: change.documentKey._id }, { $set: { id: updatedCounter?.sequence } }, { new: true });

            await PTLeaderboard.findOneAndUpdate({ userId: change.fullDocument.authorId }, { $inc: { count: 1 } }, { new: true, upsert: true });
        } else {
            const updatedCounter = await Counter.findOneAndUpdate({ namespace: change.ns }, { $inc: { sequence: -1 } }, { new: true });

            await PTQuote.deleteOne({ _id: change.documentKey._id });

            await PTLeaderboard.findOneAndUpdate({ userId: change.fullDocument.authorId }, { $inc: { count: -1 } }, { new: true });

            if (updatedCounter?.sequence && change.fullDocument.id === updatedCounter?.sequence + 1) return;
            await PTQuote.updateMany({ id: { $gt: change.fullDocument.id } }, { $inc: { id: -1 } }, { multi: true });
        }
    });
}
