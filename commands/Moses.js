const quotesSchema = require("../schemas/moses-quotes-schema");
const leaderboardSchema = require("../schemas/moses-leaderboard-schema");
const { EmbedBuilder } = require("discord.js");
const { PermissionsBitField } = require("discord.js");

module.exports = {
    category: "Moses quotes",
    description: "Moses quotes",
    slash: true,
    testOnly: true,

    options: [
        // LIST
        {
            type: 1, // subcommand
            name: "list",
            description: "List all the stored Moses quotes.",
            options: [
                {
                    name: "page",
                    description: "Which page do you want to see? (every page has 15 quotes in it).",
                    required: false,
                    type: 4,
                },
            ],
        },
        // ADD
        {
            type: 1, // subcommand
            name: "add",
            description: "Add a new Moses quote.",
            options: [
                {
                    type: 3, // string
                    name: "quote",
                    description: "What dumb bs did he say once again?",
                    required: true,
                },
            ],
        },
        // EDIT
        {
            type: 1, // subcommand
            name: "edit",
            description: "Edit an existing Moses quote.",
            options: [
                {
                    type: 4, // integer
                    name: "quote-id",
                    description: "An id of the Moses quote you would like to edit. To check a quote's id run: /moses list <page>.",
                    required: true,
                },
                {
                    type: 3, // string
                    name: "new-quote",
                    description: "What would you like to edit the quote to?",
                    required: true,
                },
            ],
        },
        // REMOVE
        {
            type: 1, // subcommand
            name: "remove",
            description: "Delete a Moses quote :sob:.",
            options: [
                {
                    type: 4, // integer
                    name: "quote-id",
                    description: "An id of the Moses quote you would like to delete. To check a quote's id run: /moses list <page>.",
                    required: true,
                },
            ],
        },
        // LEADERBOARD
        {
            type: 1, // subcommand
            name: "leaderboard",
            description: "Check the Moses quotes leaderboard!",
        },
    ],

    callback: async ({ interaction, user, member, client }) => {
        const beginTimestamp = new Date().getTime();
        let ephemeral = false;
        const embed = new EmbedBuilder().setColor("#00ff3c");

        const lastQuoteCount = await quotesSchema.find().sort({ quoteId: -1 }).limit(1);

        const handleError = (err) => {
            console.error(err);

            embed.setTitle(`An error occurred while processing your request.\nTry again later or contact a server admin.`);
            embed.setColor("#ff0000");
            ephemeral = true;
        };

        const updateChannelName = async () => {
            const quotesCount = await quotesSchema.countDocuments({});
            client.channels.cache.get("990343138268819497").setName(`Moses quotes ›› ${quotesCount.toLocaleString()}`);
        };

        // LIST
        const list = async (page) => {
            const DOCS_PER_PAGE = 15;
            const documentCount = await quotesSchema.countDocuments();
            const validPages = Math.ceil(documentCount / DOCS_PER_PAGE);

            if (!(page <= validPages && page >= 1)) {
                embed.addFields({ name: `Invalid page \`#${page}\`!`, value: `Please provide a number between **1** and **${validPages}**.` });
                embed.setColor("#ff0000");
                ephemeral = true;
                return;
            }

            const pagesRange = (page) => {
                if (page === 1) return { $gt: 0, $lt: DOCS_PER_PAGE + 1 };
                return { $gt: (page - 1) * DOCS_PER_PAGE, $lt: page * DOCS_PER_PAGE + 1 };
            };

            const quotesArray = await quotesSchema.find({ quoteId: pagesRange(page) });
            let quotesList = "";
            for (const quote of quotesArray) {
                quotesList += `**#${quote.quoteId}** \`${quote.quote}\`\n`;
            }

            if (quotesList == "") return embed.setTitle("There are no moses quotes!");

            embed.setTitle(`Displaying page **\`#${page}\`** out of **\`${validPages}\`** of Moses quotes:`);
            embed.setDescription(quotesList);
            embed.setColor("#00c8ff");
        };

        // ADD
        const add = async (quote) => {
            await new quotesSchema({
                quote,
                date: new Date(),
                submitterName: user.username,
                submitterId: user.id,
            })
                .save()
                .then(() => {
                    embed.addFields({ name: `Added quote \`#${lastQuoteCount[0]?.quoteId + 1 || "1"}\`:`, value: `**\`${quote}\`**` });
                    updateChannelName();
                });
        };

        // EDIT
        const edit = async (quoteId, newQuote) => {
            embed.setTitle("Sooooo... This command is not ready yet. Check back later tho.");
        };

        // REMOVE
        const drop = async (quoteId) => {
            embed.setTitle("Sooooo... This command is not ready yet. Check back later tho.");
        };

        // LEADERBOARD
        const leaderboard = async () => {
            const leaderboardArray = await leaderboardSchema.find().sort({ count: -1 });
            let place = 1;
            let leaderboardString = "";

            for (const user of leaderboardArray) {
                leaderboardString += `**#${place}** <@${user.userId}> **→** **\`${user.count}\`**\n`;
                place++;
            }

            if (leaderboardString == "") return embed.setTitle("The leaderboard is empty!");

            embed.setTitle(`Moses quotes leaderboard:`);
            embed.setDescription(leaderboardString);
            embed.setColor("#00c8ff");
        };

        const subcommand = `${interaction.options._subcommand.toString()}`;
        const optionalArg = interaction.options._hoistedOptions;
        switch (subcommand) {
            case "list":
                try {
                    await list(optionalArg[0]?.value || 1);
                } catch (err) {
                    handleError(err);
                }
                break;
            case "add":
                try {
                    await add(optionalArg[0]?.value, optionalArg[1]?.value);
                } catch (err) {
                    handleError(err);
                }
                break;
            case "edit":
                try {
                    await edit(optionalArg[0]?.value, optionalArg[1]?.value);
                } catch (err) {
                    handleError(err);
                }
                break;

            case "remove":
                try {
                    await drop(optionalArg[0]?.value);
                } catch (err) {
                    handleError(err);
                }
                break;
            case "leaderboard":
                try {
                    await leaderboard();
                } catch (err) {
                    handleError(err);
                }
                break;
        }

        embed.setFooter({ text: `Moses quotes \u2022 requeset took ${new Date().getTime() - beginTimestamp}ms`, iconURL: `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png` });
        if (interaction) {
            interaction.reply({
                embeds: [embed],
                ephemeral,
            });
        }
    },
};
