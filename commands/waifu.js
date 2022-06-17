const { MessageEmbed } = require('discord.js');
const axios = require('axios');

module.exports = {
    category: 'MentalBreakdown',
    description: ':3',

    options: [{
        type: 1,
        name: "random",
        description: ":3",
    }],

    slash: true,
    testOnly: true,

    callback: async({ interaction, channel, user }) => {



        await axios.get('https://api.waifu.im/random?is_nsfw=false')
            .then(async response => {
                const res = response.data.images[0];

                let tags = [];
                for (const tag of res.tags) {
                    tags.push(tag.name);
                }


                const waifuEmbed = new MessageEmbed()
                    .setColor(res.dominant_color)
                    .setAuthor({ name: 'SaintKappa Waifu Viewer', iconURL: `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=4096` })
                    .addFields({ name: 'Original source:', value: res.source, inline: true }, { name: 'Dimensions:', value: `${res.width}x${res.height}`, inline: true }, { name: 'Tags:', value: tags.join(', '), inline: true });

                if (res.is_nsfw) waifuEmbed.setAuthor({ name: 'NSFW SaintKappa Waifu Viewer', iconURL: `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=4096` });

                if (interaction) {
                    interaction.reply(`API responded with: **${res.status} ${res.statusText}**`);
                    interaction.deleteReply();
                }

                channel.send({ embeds: [waifuEmbed], files: [res.url] });
            })
            .catch(error => {
                console.error(error);
            });


    }
};