import { AttachmentBuilder, CommandInteractionOptionResolver, SlashCommandBuilder } from "discord.js";
import { CommandObject } from "../commands";

interface UnknownObject {
    [key: string]: any;
}

interface Language {
    name: string;
    url: string;
}

const languages: Language[] = [];

const headers = { Authorization: `Bearer ${process.env.GITHUB_TOKEN!!}` };

try {
    const data = (await fetch("https://api.github.com/repos/cat-milk/Anime-Girls-Holding-Programming-Books/contents/", { headers }).then((res) => res.json())) as UnknownObject[];
    for (const language of data) if (language.type !== "file") languages.push({ name: language.name, url: language.url });
} catch (err) {
    console.error(err);
}

export default {
    builder: new SlashCommandBuilder()
        .setName("aghpb")
        .setDescription("Shows an anime girl holding a programming book about the language of your choice.")
        .addStringOption((option) => option.setName("language").setDescription("A programming language the book is about. If left blank a random one will be selected.").setRequired(false)),

    run: async (interaction) => {
        const languageArg = (<CommandInteractionOptionResolver>interaction.options).getString("language")?.toLowerCase();

        const language = languageArg ? languages.find((lang) => lang.name.toLowerCase() === languageArg) : languages[Math.floor(Math.random() * languages.length)];

        if (!language) return interaction.reply({ content: "> I couldn't find that language.", ephemeral: true });

        const data = (await fetch(language.url, { headers }).then((res) => res.json())) as UnknownObject[];

        interaction.reply({
            content: `> **Here is an anime girl holding a *\`${language.name}\`* book!**`,
            files: [new AttachmentBuilder(data[Math.floor(Math.random() * data.length)].download_url)],
        });
    },
} as CommandObject;
