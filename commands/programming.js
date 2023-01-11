const { AttachmentBuilder, ApplicationCommandOptionType } = require("discord.js");
const { CommandType } = require("wokcommands");
const axios = require("axios");
require("dotenv").config();

let languages = new Array();
const headers = {
    headers: {
        Authorization: `Bearer ${process.env.GITHUB_GET_TOKEN}`,
    },
};

module.exports = {
    description: "Shows an anime girls holding a programming book from the language of your choice.",
    type: CommandType.SLASH,
    testOnly: true,
    options: [
        {
            name: "language",
            description: "Choose a programing language. If left blank a random one will be selected.",
            type: ApplicationCommandOptionType.String,
            required: false,
        },
    ],

    init: async () => {
        try {
            const getLanguages = await axios.get("https://api.github.com/repos/cat-milk/Anime-Girls-Holding-Programming-Books/contents/", headers);
            for (const language of getLanguages.data) if (language.type !== "file") languages.push(language);
            console.log("Successfuly cached anime girls.");
        } catch (err) {
            console.log("An error occured while caching anime girls.");
            console.error(err);
        }
    },

    callback: async ({ text }) => {
        // If the user didn't provide an argument choose random language else find the one they chose
        const chosenLanguage = !text ? languages[Math.floor(Math.random() * languages.length)] : languages.find((lang) => lang.name.toUpperCase() === text.toUpperCase());

        if (!chosenLanguage) return { content: `**Language *\`${text}\`* does not exist in the repo.**`, ephermal: true };

        const languageResponse = await axios.get(chosenLanguage.url, headers);

        const attachment = new AttachmentBuilder(languageResponse.data[Math.floor(Math.random() * languageResponse.data.length)].download_url);

        return {
            content: `**Here is your waifu holding a *\`${chosenLanguage.name}\`* book:**`,
            files: [attachment],
        };
    },
};
