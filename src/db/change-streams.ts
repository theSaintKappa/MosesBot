import { DBSequenceCounter } from "@/models/DBSequenceCounter";
import { MosesQuote } from "@/models/MosesQuote";
import { MosesQuoteLeaderboard } from "@/models/MosesQuoteLeaderboard";
import { PtQuote } from "@/models/PtQuote";
import { PtQuoteLeaderboard } from "@/models/PtQuoteLeaderboard";
import { logger } from "@/utils/logger";

const log = logger("MosesDB");

export function watchMosesQuotes() {
    log("👁️  Now watching moses.quotes for changes.");
    MosesQuote.watch([{ $match: { $or: [{ operationType: "insert" }, { "updateDescription.updatedFields._deleting": { $exists: true } }] } }], { fullDocument: "updateLookup" }).on("change", async (change) => {
        // TODO: write types for theese change objects

        if (!change.fullDocument._deleting) {
            const updatedCounter = await DBSequenceCounter.findOneAndUpdate({ namespace: change.ns }, { $inc: { sequence: 1 } }, { new: true, upsert: true });

            await MosesQuote.findOneAndUpdate({ _id: change.documentKey._id }, { $set: { id: updatedCounter?.sequence } }, { new: true });

            await MosesQuoteLeaderboard.findOneAndUpdate({ userId: change.fullDocument.submitterId }, { $inc: { count: 1 } }, { new: true, upsert: true });
        } else {
            const updatedCounter = await DBSequenceCounter.findOneAndUpdate({ namespace: change.ns }, { $inc: { sequence: -1 } }, { new: true });

            await MosesQuote.deleteOne({ _id: change.documentKey._id });

            await MosesQuoteLeaderboard.findOneAndUpdate({ userId: change.fullDocument.submitterId }, { $inc: { count: -1 } }, { new: true });

            if (updatedCounter?.sequence && change.fullDocument.id === updatedCounter?.sequence + 1) return;
            await MosesQuote.updateMany({ id: { $gt: change.fullDocument.id } }, { $inc: { id: -1 } }, { multi: true });
        }
    });
}

export function watchPtQuotes() {
    log("👁️  Now watching pt.quotes for changes.");
    PtQuote.watch([{ $match: { $or: [{ operationType: "insert" }, { "updateDescription.updatedFields._deleting": { $exists: true } }] } }], { fullDocument: "updateLookup" }).on("change", async (change) => {
        if (!change.fullDocument._deleting) {
            const updatedCounter = await DBSequenceCounter.findOneAndUpdate({ namespace: change.ns }, { $inc: { sequence: 1 } }, { new: true, upsert: true });

            await PtQuote.findOneAndUpdate({ _id: change.documentKey._id }, { $set: { id: updatedCounter?.sequence } }, { new: true });

            await PtQuoteLeaderboard.findOneAndUpdate({ userId: change.fullDocument.authorId }, { $inc: { count: 1 } }, { new: true, upsert: true });
        } else {
            const updatedCounter = await DBSequenceCounter.findOneAndUpdate({ namespace: change.ns }, { $inc: { sequence: -1 } }, { new: true });

            await PtQuote.deleteOne({ _id: change.documentKey._id });

            await PtQuoteLeaderboard.findOneAndUpdate({ userId: change.fullDocument.authorId }, { $inc: { count: -1 } }, { new: true });

            if (updatedCounter?.sequence && change.fullDocument.id === updatedCounter?.sequence + 1) return;
            await PtQuote.updateMany({ id: { $gt: change.fullDocument.id } }, { $inc: { id: -1 } }, { multi: true });
        }
    });
}
