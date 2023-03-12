const { EmbedBuilder } = require('discord.js');
const { CommandType } = require('wokcommands');
const axios = require('axios');

let version;
module.exports = {
    description: 'List all the available Moses bot commands',
    type: CommandType.SLASH,
    testOnly: true,

    init: async () => {
        try {
            const res = await axios.get('https://raw.githubusercontent.com/theSaintKappa/MosesBot/master/package.json');
            version = `v${res.data.version} `;
        } catch (err) {
            console.log(err);
            version = '';
        }
    },

    callback: async () => {
        const embed = new EmbedBuilder().setTitle(`MosesBot ${version}command help:`).setColor('Random').addFields(
            { name: '\u200B', value: '╒═════ ***Quotes***' },
            { name: '/moses [add/edit/remove/list/leaderboard]', value: 'add, edit, remove a Moses quote, list all of them or check the leaderboard' },
            { name: '/2pT [add/edit/remove/list/leaderboard]', value: 'add, edit, remove a 2pT quote, list all of them or check the leaderboard' },
            { name: '╘═════', value: '\u200B' },

            { name: '\u200B', value: '╒═════ ***Utilities***' },
            { name: '/moses-grades', value: "Check Moses' grades. Powered by [SaintKappa API](https://api.saintkappa.xyz)" },
            { name: '/waifu [sfw/nsfw]', value: 'I apologize. Powered by [Waifu.im](https://www.waifu.im)' },
            { name: '/programming [language]', value: 'Display an anime girl holding a programming book. Powered by [AGHPB](https://github.com/cat-milk/Anime-Girls-Holding-Programming-Books)' },
            { name: '╘═════', value: '\u200B' },

            { name: '\u200B', value: '╒═════ ***Admin commands***' },
            { name: '/reroll <clear previous?>', value: "Re-roll today's daily quote" },
            { name: '/presence [type] [name] <status>', value: 'Change the bot presence' },
            { name: '/clear [amount]', value: 'Purge messages from the current channel' },
            { name: '/say [message]', value: 'Sudo the bot to say something' },
            { name: '/pingspam [start/stop] [user]', value: 'Torture someone via discord mentions' },
            { name: '/command', value: 'Display all the global & guild scoped slash commands' },
            { name: '/uploader [add/remove]', value: 'Manage the pics uploaders whitelist' },
            { name: '╘═════', value: '\u200B\n**Bot made with 💗 by [SaintKappa](https://github.com/theSaintKappa)**' }
        );

        return { embeds: [embed] };
    },
};
