const { AttachmentBuilder, EmbedBuilder } = require('discord.js');
const axios = require('axios');
require('dotenv').config();

module.exports = {
    category: 'MentalBreakdown',
    description: 'Anime Girls Holding Programming Books',


    options: [{
        type: 3,
        name: "language",
        description: "Choose programing language. If left blank a Random language will be selected.",
        required: false
    }],


    slash: true,
    testOnly: true,

    callback: async({ interaction, args, channel }) => {

        function reply(content, ephemeral = false) {
            if (interaction) {
                interaction.reply({
                    content,
                    ephemeral
                });
            }
        }

        const config = {
            headers: {
                Authorization: `token ${process.env.GITHUB_GET_TOKEN}`,
            }
        }

        await axios.get('https://api.github.com/repos/cat-milk/Anime-Girls-Holding-Programming-Books/contents/', config)
            .then(async response => {


                const res = response.data;

                let languagesArray = [];
                for (const language of res) {
                    if (language.name != 'README.md' && language.name != 'CONTRIBUTING.md') {
                        languagesArray.push(language);
                        language.name = language.name.toUpperCase();
                    }
                }

                RandomLanguageIndex = Math.floor(Math.random() * (languagesArray.length));
                RandomLanguage = languagesArray[RandomLanguageIndex];

                const chosen = args[0] === undefined ? RandomLanguage : languagesArray.find(lang => lang.name === args[0].toUpperCase());

                if (chosen === undefined) {
                    reply(`**Language** \`${args[0]}\` **does not exist in the repo.**`, true);
                    return;
                }

                await axios.get(chosen.url)
                    .then(async response => {
                        RandomPicIndex = Math.floor(Math.random() * (response.data.length));

                        // reply(`**Here is your waifu holding a** \`${chosen.path}\` **book.**\n${response.data[RandomPicIndex].download_url}`);

                        const attachment = new AttachmentBuilder(response.data[RandomPicIndex].download_url);


                        interaction.reply({
                            content: `**Here is your waifu holding a** \`${chosen.path}\` **book.**`,
                            // attachments: response.data[RandomPicIndex].download_url,
                            files: [attachment]
                        });
                        // await channel.send({ files: [attachment] });
                    })
                    .catch(error => {
                        console.error(error);
                    });
            })
            .catch(error => {
                console.error(error);
            });


    }
};