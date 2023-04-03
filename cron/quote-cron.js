// const cron = require('node-cron');
const cron = require('node-schedule');
const axios = require('axios');
const sendQuote = require('../send-quote');

module.exports = (instance, client) => {
    cron.scheduleJob(
        '15 7 * * *', // Everyday at 7:15
        async () => {
            try {
                sendQuote(client);

                const moses = [...'Moses'].sort(() => 0.5 - Math.random());
                client.guilds.cache.get('980813190780841984').members.cache.get('389021335285661707').setNickname(moses.join(''));

                const request = await axios.get(`https://api.saintkappa.xyz/vulcan/luckyNumber`);
                client.channels.cache.get('1067438722703953992').setName(`🍀🔢 ›› ${request.data.number ?? 'brak'}`);
            } catch (err) {
                console.error(err);
            }
        }
    );
};
