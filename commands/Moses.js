const { EmbedBuilder, PermissionsBitField, AttachmentBuilder, ApplicationCommandOptionType } = require("discord.js");
const quotesSchema = require("../schemas/moses-quotes-schema");
const leaderboardSchema = require("../schemas/moses-leaderboard-schema");
const picsSchema = require("../schemas/moses-pics-schema");
const { CommandType } = require("wokcommands");

module.exports = {
    description: "All the Moses quotes related commands.",
    type: CommandType.SLASH,
    testOnly: true,
    options: [
        // LIST
        {
            type: ApplicationCommandOptionType.Subcommand,
            name: "list",
            description: "List all the stored Moses quotes.",
            options: [
                {
                    name: "page",
                    description: "Which page do you want to see? (every page has 15 quotes in it).",
                    required: false,
                    type: ApplicationCommandOptionType.Number,
                },
            ],
        },
        // ADD
        {
            type: ApplicationCommandOptionType.Subcommand,
            name: "add",
            description: "Add a new Moses quote.",
            options: [
                {
                    type: ApplicationCommandOptionType.String,
                    name: "quote",
                    description: "What dumb bs did he say once again?",
                    required: true,
                },
            ],
        },
        // EDIT
        {
            type: ApplicationCommandOptionType.Subcommand,
            name: "edit",
            description: "Edit an existing Moses quote.",
            options: [
                {
                    type: ApplicationCommandOptionType.Number,
                    name: "quote-id",
                    description: "An id of the Moses quote you would like to edit. To check a quote's id run: /moses list <page>.",
                    required: true,
                },
                {
                    type: ApplicationCommandOptionType.String,
                    name: "new-quote",
                    description: "What would you like to edit the quote to?",
                    required: true,
                },
            ],
        },
        // REMOVE
        {
            type: ApplicationCommandOptionType.Subcommand,
            name: "remove",
            description: "Delete a Moses quote :sob:.",
            options: [
                {
                    type: ApplicationCommandOptionType.Number,
                    name: "quote-id",
                    description: "An id of the Moses quote you would like to delete. To check a quote's id run: /moses list <page>.",
                    required: true,
                },
            ],
        },
        // LEADERBOARD
        {
            type: ApplicationCommandOptionType.Subcommand,
            name: "leaderboard",
            description: "Check the Moses quotes leaderboard!",
        },
        // PIC
        // {
        //     type: ApplicationCommandOptionType.Subcommand,
        //     name: "pic",
        //     description: "Have a schmoking hot Moses pic and would like to share it with the commuinty?",
        //     options: [
        //         {
        //             name: "attachment",
        //             description: "Upload a file in any of these formats: PNG, JPG, JPEG, GIF or WEBP.",
        //             type: 11, // attachment
        //             required: true,
        //         },
        //         {
        //             name: "description",
        //             description: "Describe your Moses (optional).",
        //             type: 3, // attachment
        //             required: false,
        //         },
        //     ],
        // },
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
            client.channels.cache.get("990343138268819497").setName(`🛐 Moses Quotes ›› ${quotesCount.toLocaleString()}`);
        };

        // LIST
        const list = async (page) => {
            const DOCS_PER_PAGE = 15;
            const documentCount = await quotesSchema.countDocuments();
            const validPages = Math.ceil(documentCount / DOCS_PER_PAGE);

            if (documentCount === 0) {
                embed.setTitle("There are no Moses quotes currently saved!");
                embed.setColor("#ff0000");
                ephemeral = true;
                return;
            }

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

            const quotesArray = await quotesSchema.find({ quoteId: pagesRange(page) }).sort({ quoteId: 1 });
            let quotesList = "";
            for (const quote of quotesArray) {
                quotesList += `**#${quote.quoteId}** \`${quote.quote}\`\n`;
            }

            embed.setTitle(`Displaying page **\`#${page}\`** out of **\`${validPages}\`** of Moses quotes:`);
            embed.setDescription(quotesList);
            embed.setColor("#00c8ff");
        };

        // ADD
        const add = async (quote) => {
            const leaderboardUser = await leaderboardSchema.find({ userId: user.id });
            if (!leaderboardUser) {
                await new leaderboardSchema({
                    userId: user.id,
                    userName: user.username,
                    count: 1,
                }).save();
            }

            await new quotesSchema({
                quote,
                date: new Date(),
                submitterName: user.username,
                submitterId: user.id,
            }).save();

            embed.addFields({ name: `Added quote \`#${lastQuoteCount[0]?.quoteId + 1 || "1"}\`:`, value: `**\`${quote}\`**` });
            updateChannelName();
        };

        // EDIT
        const edit = async (quoteId, newQuote) => {
            const quoteToEdit = await quotesSchema.findOne({ quoteId });

            if (quoteToEdit === null) {
                embed.setDescription(`Quote **\`#${quoteId}\`** doesn't exist.`);
                embed.setColor("#ff0000");
                ephemeral = true;
                return;
            }

            // Edit in admin mode
            if (member.permissions.has(PermissionsBitField.Flags.Administrator)) {
                await quotesSchema.updateOne({ quoteId }, { quote: newQuote }).then(() => {
                    embed.setDescription(`Quote **\`#${quoteToEdit.quoteId} ${quoteToEdit.quote}\`**\nwas updated to:\n"**${newQuote}**"\n\n(admin mode)`);
                });
                return;
            }

            // Edit in member mode (anly allow users to edit quotes they submitted)
            if (quoteToEdit.submitterId == user.id) {
                await quotesSchema.updateOne({ quoteId }, { quote: newQuote }).then(() => {
                    embed.setDescription(`Quote **\`#${quoteToEdit.quoteId} ${quoteToEdit.quote}\`**\nwas updated to:\n"**${newQuote}**"`);
                });
                return;
            }

            // Deny editing
            embed.setDescription(`Unfortunately quote **\`#${quoteToEdit.quoteId} ${quoteToEdit.quote}\`** was submitted by <@${quoteToEdit.submitterId}>.\nIf you want it edited ask them or a server admin.`);
            embed.setColor("#ff0000");
            ephemeral = true;
        };

        // REMOVE
        const drop = async (quoteId) => {
            const quoteToDrop = await quotesSchema.findOne({ quoteId });

            // Check if document exists
            if (quoteToDrop === null) {
                embed.setDescription(`Quote **\`#${quoteId}\`** doesn't exist.`);
                embed.setColor("#ff0000");
                ephemeral = true;
                return;
            }

            // Edit in admin mode
            if (member.permissions.has(PermissionsBitField.Flags.Administrator)) {
                await quotesSchema.deleteOne({ quoteId }).then(async () => {
                    embed.setDescription(`Quote **\`#${quoteToDrop.quoteId} ${quoteToDrop.quote}\`** has been **permanently deleted**.\n(admin mode)`);
                    updateChannelName();
                });
                return;
            }

            // Edit in member mode (anly allow users to edit quotes they submitted)
            if (quoteToDrop.submitterId == user.id) {
                await quotesSchema.deleteOne({ quoteId }).then(async () => {
                    embed.setDescription(`Quote **\`#${quoteToDrop.quoteId} ${quoteToDrop.quote}\`** has been **permanently deleted**.`);
                    updateChannelName();
                });
                return;
            }

            // Deny editing
            embed.setDescription(`Unfortunately quote **\`#${quoteToDrop.quoteId} ${quoteToDrop.quote}\`** was submitted by <@${quoteToDrop.submitterId}>.\nIf you want it removed ask them or a server admin.`);
            embed.setColor("#ff0000");
            ephemeral = true;
            return;
        };

        // LEADERBOARD
        const leaderboard = async () => {
            const leaderboardArray = await leaderboardSchema.find().sort({ count: -1 });
            if (leaderboardArray == "") return embed.setTitle("The Moses leaderboard is empty!");
            let place = 1;
            let leaderboardString = "";

            for (const user of leaderboardArray) {
                leaderboardString += `**#${place}** <@${user.userId}> **→** **\`${user.count}\`**\n`;
                place++;
            }

            embed.setTitle(`Moses quotes leaderboard:`);
            embed.setDescription(leaderboardString);
            embed.setColor("#00c8ff");
        };

        // PIC
        const pic = async (file, description) => {
            const allowedFileFormats = ["image/jpeg", "image/png", "image/gif", "image/webp"];
            if (!allowedFileFormats.includes(file.contentType)) {
                embed.setTitle(`Only avaliable file formats are: PNG, JPG, JPEG, GIF or WEBP`);
                embed.setColor("#ff0000");
                ephemeral = true;
                return;
            }

            // embed.setAuthor({ name: "SaintKappa Waifu Viewer", iconURL: `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=4096` })
            if (typeof description !== "undefined") embed.addFields({ name: "Description:", value: description.toString(), inline: true });
            embed.addFields({ name: "Dimensions:", value: `${file.width}x${file.height}`, inline: true }, { name: "File size:", value: `${parseFloat(file.size / Math.pow(1024, 2)).toFixed(2)}MB`, inline: true });
            embed.setTitle(`Succesfully uploaded your image to the MosesDB!`);
            embed.setURL(file.url);
            embed.setImage(file.url);
            ephemeral = true;

            const storageEmbed = new EmbedBuilder()
                .setDescription(`+<@${user.id}> uploaded a new moses pic!`)
                .addFields(
                    { name: "Description:", value: description || "*none*", inline: true },
                    { name: "Dimensions:", value: `${file.width}x${file.height}`, inline: true },
                    { name: "File size:", value: `${parseFloat(file.size / Math.pow(1024, 2)).toFixed(2)}MB`, inline: true }
                );

            client.channels.cache.get("1058118420186542120").send({
                embeds: [storageEmbed],
                files: [new AttachmentBuilder(`${file.url}`)],
            });
        };

        const subcommand = interaction.options._subcommand;
        const args = interaction.options._hoistedOptions;
        switch (subcommand) {
            case "list":
                try {
                    await list(args[0]?.value || 1);
                } catch (err) {
                    handleError(err);
                }
                break;
            case "add":
                try {
                    await add(args[0]?.value);
                } catch (err) {
                    handleError(err);
                }
                break;
            case "edit":
                try {
                    await edit(args[0]?.value, args[1]?.value);
                } catch (err) {
                    handleError(err);
                }
                break;
            case "remove":
                try {
                    await drop(args[0]?.value);
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
            case "pic":
                try {
                    await pic(args[0]?.attachment, args[1]?.value);
                } catch (err) {
                    handleError(err);
                }
                break;
        }

        embed.setFooter({ text: `Moses quotes \u2022 requeset took ${new Date().getTime() - beginTimestamp}ms`, iconURL: `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png` });
        return {
            embeds: [embed],
            ephemeral,
        };
    },
};
