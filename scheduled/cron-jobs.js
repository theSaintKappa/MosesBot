const cron = require("node-cron");
const { sendDailyQuote } = require("./daily-quote");
const { sendDailyPic } = require("./daily-pic");

const scheduleCron = () => {
    cron.schedule(
        "15 7 * * *", // Everyday at 7:15
        () => {
            const date = new Date();
            console.log(`[Moses Daily Quotes] ${date.getHours()}:${("0" + date.getMinutes()).slice(-2)} sending ${weekdays[date.getDay()]} quote...`);
            sendDailyQuote();
        },
        { timezone: "Europe/Warsaw" }
    );

    cron.schedule(
        "0 0 * * *", // Everyday at midnight
        () => {
            const randomHour = Math.floor(Math.random() * 23);
            const randomMinute = Math.floor(Math.random() * 59) + 1;
            console.log(`[Moses Daily Pics] Job scheduled for ${randomHour}:${randomMinute} today.`);

            const task = cron.schedule(
                `${randomMinute} ${randomHour} * * *`,
                () => {
                    const date = new Date();
                    console.log(`[Moses Daily Pics] ${weekdays[date.getDay()]} ${date.getHours()}:${("0" + date.getMinutes()).slice(-2)} sending random Moses pic...`);
                    sendDailyPic();
                    setInterval(() => {
                        task.stop();
                    }, 1000);
                },
                {
                    scheduled: true,
                }
            );
        },
        { timezone: "Europe/Warsaw" }
    );
};

module.exports = { scheduleCron };
