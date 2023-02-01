const { EmbedBuilder, ApplicationCommandOptionType } = require('discord.js');
const { CommandType } = require('wokcommands');
const axios = require('axios');
let tags = new Object();

module.exports = {
    description: ':3',
    type: CommandType.SLASH,
    testOnly: true,
    options: [
        {
            type: ApplicationCommandOptionType.Subcommand,
            name: 'sfw',
            description: 'When moms home',
            options: [
                {
                    name: 'tags',
                    description: 'tags',
                    required: false,
                    type: ApplicationCommandOptionType.String,
                    autocomplete: true,
                },
            ],
        },
        {
            type: ApplicationCommandOptionType.Subcommand,
            name: 'nsfw',
            description: 'When moms NOT home',
            options: [
                {
                    name: 'tags',
                    description: 'tags',
                    required: false,
                    type: ApplicationCommandOptionType.String,
                    autocomplete: true,
                },
            ],
        },
    ],

    init: async () => {
        try {
            const getTags = await axios.get('https://api.waifu.im/tags/?full=false');
            tags.sfw = getTags.data.versatile;
            tags.nsfw = getTags.data.nsfw;
            console.log('Successfuly cached waifu api tags.');
        } catch (err) {
            console.log('An error occured while caching waifu api tags.');
            console.error(err);
        }
    },

    autocomplete: (command, argument, interaction) => {
        if (interaction.options._subcommand === 'sfw') return tags.sfw;
        return tags.nsfw;
    },

    callback: async ({ interaction }) => {
        const embed = new EmbedBuilder();
        const tagArg = interaction.options._hoistedOptions[0]?.value;
        const isNsfw = interaction.options._subcommand === 'sfw' ? false : true;

        if (![...tags.sfw, ...tags.nsfw].includes(tagArg) && typeof tagArg !== 'undefined') {
            embed.setColor('#ff0000').addFields({ name: `Tag **\`${tagArg}\`** doesn't exist!`, value: 'If you leave the tag blank a random one will be selected.' });
            return {
                embeds: [embed],
                ephemeral: true,
            };
        }

        try {
            const request = await axios.get(`https://api.waifu.im/search?is_nsfw=${isNsfw}${tagArg !== undefined ? `&included_tags=${tagArg}` : ''}`);

            const waifu = request.data.images[0];

            let tags = waifu.tags.map((tag) => tag.name);
            embed
                .setImage(waifu.url)
                .setColor(waifu.dominant_color)
                .addFields(
                    { name: 'Original source:', value: waifu.source ?? 'none', inline: false },
                    { name: 'Dimensions:', value: `${waifu.width}x${waifu.height}`, inline: true },
                    { name: 'Uploaded at:', value: `<t:${Math.floor(new Date(waifu.uploaded_at).getTime() / 1000)}:f>`, inline: true },
                    { name: 'Tags:', value: tags.join(', '), inline: true }
                );

            return {
                embeds: [embed],
                ephemeral: isNsfw,
            };
        } catch (err) {
            console.error(err);

            embed.setColor('#ff0000').addFields({ name: 'An error occured while procesing your request.', value: 'Try again later or contact a server admin.' });
            return {
                embeds: [embed],
                ephemeral: true,
            };
        }

        // console.error(error);
        // if (interaction) {
        //     interaction.reply({
        //         content: `An error occurred while fetching data. Please try again later or contact an server admin.\n\`${error.response.status} - ${error.response.statusText}\``,
        //     });
        // }
    },
};
