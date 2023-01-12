exports = async function (changeEvent) {
    const docId = changeEvent.fullDocument._id;
    const db = context.services.get("MosesQuotes").db(changeEvent.ns.db);
    const counterCol = db.collection("pt-counter");
    const quotesCol = db.collection(changeEvent.ns.coll);
    const leaderboardCol = db.collection("pt-leaderboard");

    const updateCounterSequence = await counterCol.findOneAndUpdate({ _id: changeEvent.ns }, { $inc: { seq_value: 1 } }, { returnNewDocument: true, upsert: true });
    console.log(`Updated counter sequence to ${updateCounterSequence.seq_value}`);
    const updateQuote = await quotesCol.findOneAndUpdate({ _id: docId }, { $set: { quoteId: updateCounterSequence.seq_value } }, { returnNewDocument: true });
    console.log(`Updated quoteId on '${updateQuote.quote}'`);
    const updateLeaderboard = await leaderboardCol.findOneAndUpdate({ userId: updateQuote.quoteeId }, { $inc: { count: 1 } }, { returnNewDocument: true });
    console.log(`Incremented leaderboard for ${updateLeaderboard.userName}#${updateLeaderboard.userId}`);
};
