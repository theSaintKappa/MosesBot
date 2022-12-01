const picsSchema = require("./schemas/moses-pics-schema");
const { Webhook, MessageBuilder } = require("discord-webhook-node");

const sendDailyPic = async () => {
    const picsArray = await picsSchema.find({});

    const randomIndex = Math.floor(Math.random() * picsArray.length);
    const chosenPic = picsArray[randomIndex];

    const embed = new MessageBuilder();
    if (chosenPic.description !== null) embed.addField("Description:", chosenPic.description.toString(), false);
    embed
        .setTitle(`Here is a random Moses pic for today!`)
        .setURL(chosenPic.fileUrl)
        .setImage(chosenPic.fileUrl)
        .addField("Author:", `<@${chosenPic.uploader.userId}>`, true)
        .addField("Upload date:", `<t:${Math.floor(new Date(chosenPic.uploadDate).getTime() / 1000)}:R>`, true)
        .addField("Dimensions:", `${chosenPic.fileDimensions.width}x${chosenPic.fileDimensions.height}`, true)
        // .addField("File size:", `${parseFloat(chosenPic.fileSize / Math.pow(1024, 2)).toFixed(2)}MB`, true)
        .setColor(`#${Math.floor(Math.random() * 16777215).toString(16)}`);

    const webhook = new Webhook(process.env.MOSES_PICS_WEBHOOK_URL);
    webhook
        .send(embed)
        .then(() => {
            console.log("Sent webhook successfully!");
        })
        .catch((err) => {
            console.error(err);
        });
};

module.exports = { sendDailyPic };
