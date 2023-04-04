const cron = require('node-schedule');
const axios = require('axios');
const sendQuote = require('../send-quote');

const rule = new cron.RecurrenceRule();
rule.hour = process.env.QUOTE_HOUR || 7;
rule.minute = process.env.QUOTE_MINUTE || 15;
rule.tz = process.env.QUOTE_TZ || 'Europe/Warsaw';

module.exports = (instance, client) => {
    cron.scheduleJob(rule, async () => {
        try {
            sendQuote(client);

            const moses = [...'Moses'].sort(() => 0.5 - Math.random());
            client.guilds.cache.get('980813190780841984').members.cache.get('389021335285661707').setNickname(moses.join(''));

            const request = await axios.get(`https://api.saintkappa.xyz/vulcan/luckyNumber`);
            client.channels.cache.get('1067438722703953992').setName(`🍀🔢 ›› ${request.data.number ?? 'brak'}`);
        } catch (err) {
            console.error(err);
        }
    });
};
