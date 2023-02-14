const { EmbedBuilder } = require('discord.js');
const { CommandType } = require('wokcommands');
const axios = require('axios');

module.exports = {
    description: "Check Moses' grades!",
    type: CommandType.SLASH,
    testOnly: true,

    callback: async ({ interaction, user }) => {
        const embed = new EmbedBuilder();
        let request;

        const start = new Date().getTime();
        try {
            request = await axios.get(`https://api.saintkappa.xyz/vulcan/grades`);
        } catch (err) {
            console.error(err);

            embed.setTitle(`An error occurred while processing your request.\nTry again later or contact a server admin.`);
            embed.setColor('#ff0000');
            return { embeds: [embed], ephemeral: true };
        }

        const grouppedGrades = await request.data.reduce((result, obj) => {
            (result[obj.column.subject.name] || (result[obj.column.subject.name] = [])).push(obj);
            return result;
        }, {});

        const fields = Object.values(grouppedGrades).map((obj) => {
            return { name: obj[0].column.subject.name, value: `\`\`\`r\n${obj.map((grade) => grade.content).join(', ')}\`\`\``, inline: true };
        });

        embed
            .addFields(...fields)
            .setColor('#fe3776')
            .setTitle("Here are Moses' current grades:")
            .setFooter({ text: `SaintKappa Vulcan API \u2022 ${new Date().getTime() - start}ms`, iconURL: `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png` });

        return {
            embeds: [embed],
        };
    },
};
