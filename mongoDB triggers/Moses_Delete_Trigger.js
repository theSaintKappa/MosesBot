exports = async function (changeEvent) {
    const doc = changeEvent.fullDocumentBeforeChange;
    const db = context.services.get("MosesQuotes").db(changeEvent.ns.db);

    const counterCol = db.collection("moses-counter");
    await counterCol.findOneAndUpdate({ _id: changeEvent.ns }, { $inc: { seq_value: -1 } }, { upsert: true });

    const leaderboardCol = db.collection("moses-leaderboard");
    const updateLeaderboard = await leaderboardCol.findOneAndUpdate({ userId: doc.submitterId }, { $inc: { count: -1 } }, { returnNewDocument: true });
    console.log(`Decremented leaderboard for ${updateLeaderboard.userName}#${updateLeaderboard.userId}`);

    const counterDoc = await counterCol.find({}).toArray();
    if (doc.quoteId == counterDoc[0].seq_value + 1) return console.log(`Deleted document was last in collection`);

    context.services
        .get("MosesQuotes")
        .db(changeEvent.ns.db)
        .collection("moses-quotes")
        .updateMany({ quoteId: { $gt: doc.quoteId } }, { $inc: { quoteId: -1 } }, { multi: true });

    console.log(`Updated documents with id greater than ${doc.quoteId}`);
};
