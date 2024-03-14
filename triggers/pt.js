exports = async function (changeEvent) {
    const docId = changeEvent.documentKey._id;
    const db = context.services.get("Moses").db("MosesDB");
    const namespace = changeEvent.ns;
    const counter = db.collection("db.counter");
    const quotes = db.collection(changeEvent.ns.coll);
    const leaderboard = db.collection("pt.leaderboard");

    try {
        if (changeEvent.operationType === "insert") {
            console.log(`Insert operation on ${namespace.coll}`);
            const { sequence } = await counter.findOneAndUpdate({ namespace }, { $inc: { sequence: parseInt(1, 10) } }, { returnNewDocument: true, upsert: true });
            console.log(`Incremented ${namespace.coll} counter to ${sequence}`);

            const { id, authorId } = await quotes.findOneAndUpdate({ _id: docId }, { $set: { id: sequence } }, { returnNewDocument: true });
            console.log(`Appended ${namespace.coll} document with id ${id}`);

            const { userId } = await leaderboard.findOneAndUpdate({ userId: authorId }, { $inc: { count: parseInt(1, 10) }, $set: { updatedAt: new Date() }, $setOnInsert: { createdAt: new Date() } }, { returnNewDocument: true, upsert: true });
            console.log(`Incremented ${namespace.coll} leaderboard count for @${userId}`);
        } else if (changeEvent.operationType === "delete") {
            console.log(`Delete operation on ${namespace.coll}`);
            const docBeforeChange = changeEvent.fullDocumentBeforeChange;

            const { sequence } = await counter.findOneAndUpdate({ namespace }, { $inc: { sequence: parseInt(-1, 10) } }, { returnNewDocument: true });
            console.log(`Decremented ${namespace.coll} counter to ${sequence}`);

            const { userId } = await leaderboard.findOneAndUpdate({ userId: docBeforeChange.authorId }, { $inc: { count: parseInt(-1, 10) }, $set: { updatedAt: new Date() } }, { returnNewDocument: true });
            console.log(`Decremented ${namespace.coll} leaderboard count for @${userId}`);

            const counterDocument = await counter.find().toArray();
            if (docBeforeChange.id == counterDocument[0].sequence + 1) return;

            await quotes.updateMany({ id: { $gt: docBeforeChange.id } }, { $inc: { id: parseInt(-1, 10) } }, { multi: true });
            console.log(`Updated ${namespace.coll} documents with id > ${docBeforeChange.id}`);
        }
    } catch (err) {
        console.log("error performing mongodb write: ", err.message);
    }
};
