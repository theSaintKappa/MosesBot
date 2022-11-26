const quotesSchema = require("../schemas/pt-quotes-schema");
const counterSchema = require("../schemas/pt-counter-schema");
const { EmbedBuilder } = require("discord.js");
const { PermissionsBitField } = require("discord.js");

module.exports = {
    category: "2pT quotes",
    description: "2pT quotes",
    slash: true,
    testOnly: true,

    options: [
        // LIST
        {
            type: 1, // subcommand
            name: "list",
            description: "List all the 2pT quotes.",
        },
        // ADD
        {
            type: 1, // subcommand
            name: "add",
            description: "Add a quote to the 2pT quotes DB.",
            options: [
                {
                    type: 6, // user
                    name: "user",
                    description: "Wich server member said the quote?",
                    required: true,
                },
                {
                    type: 3, // string
                    name: "quote",
                    description: "What did they/them say?", // satire ok?
                    required: true,
                },
            ],
        },
        // EDIT
        {
            type: 1, // subcommand
            name: "edit",
            description: "Edit a quote stored in the 2pT quotes DB.",
            options: [
                {
                    type: 4, // integer
                    name: "quote-id",
                    description: "Provide an id for the quote you would like to edit. To check a quote's id run: /2pt list",
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
            description: "Delete a quote from the 2pT quotes DB.",
            options: [
                {
                    type: 4, // integer
                    name: "quote-id",
                    description: "Provide an id for the quote you would like to delete. To check a quote's id run: /2pt list",
                    required: true,
                },
            ],
        },
    ],

    callback: async ({ interaction, user, member, client }) => {
        const quotesArray = await quotesSchema.find({});
        const lastQuoteCount = await quotesSchema.find().sort({ quoteId: -1 }).limit(1);
        let ephemeral = false;
        const embed = new EmbedBuilder()
            .setColor("#00ff3c")
            .setTimestamp()
            .setFooter({ text: "2pT quotes DB", iconURL: `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png` });

        const handleError = (err) => {
            console.error(err);

            embed.setTitle(`An error occurred while processing your request.\nTry again later or contact a server admin.`);
            embed.setColor("#ff0000");
            ephemeral = true;
        };

        const updateChannelName = async () => {
            const quotesCount = await quotesSchema.countDocuments({});
            client.channels.cache.get("1029373422779781190").setName(`2pT Quotes ›› ${quotesCount.toLocaleString()}`);
        };

        // LIST
        const list = async () => {
            var quotesString = "";
            quotesArray.every((quote) => {
                quotesString += `**#${quote.quoteId}** **\`${quote.quote}\`**(said by <@${quote.quoteeId}>)\n`;
                if (quotesString.length > 4000) {
                    quotesString += "***+more***";
                    return false;
                } else return true;
            });
            if (quotesString == "") {
                embed.setTitle("The 2pT quotes DB is empty! Add a quote by running **`/2pt add`**");
                embed.setColor("#ff0000");
                ephemeral = true;
                return;
            }
            embed.setTitle("Here are all the currently stored 2pT Quotes:");
            embed.setColor("#00c8ff");
            embed.setDescription(quotesString);
        };

        // ADD
        const add = async (quoteeUser, quote) => {
            await new quotesSchema({
                quoteeId: quoteeUser,
                quote: quote,
                dateAdded: new Date(),
                submitterId: user.id,
            })
                .save()
                .then(() => {
                    embed.setDescription(`Added quote **\`#${lastQuoteCount[0]?.quoteId + 1 || "1"}\`**: "**${quote}**"\n(said by <@${quoteeUser}>)`);
                })
                .catch((err) => {
                    handleError(err);
                    return;
                });
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
                await quotesSchema
                    .updateOne({ quoteId }, { quote: newQuote })
                    .then(() => {
                        embed.setDescription(`Quote **\`#${quoteToEdit.quoteId} ${quoteToEdit.quote}\`**\nwas updated to:\n"**${newQuote}**"\n\n(admin mode)`);
                    })
                    .catch((err) => {
                        handleError(err);
                    });
                return;
            }

            // Edit in member mode (anly allow users to edit quotes they submitted)
            if (quoteToEdit.submitterId == user.id) {
                await quotesSchema
                    .updateOne({ quoteId }, { quote: newQuote })
                    .then(() => {
                        embed.setDescription(`Quote **\`#${quoteToEdit.quoteId} ${quoteToEdit.quote}\`**\nwas updated to:\n"**${newQuote}**"`);
                    })
                    .catch((err) => {
                        handleError(err);
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

            if (!member.permissions.has(PermissionsBitField.Flags.Administrator)) {
                // Check the quote was submited by the curren user
                if (quoteToDrop.submitterId != member.id) {
                    embed.setDescription(`Unfortunately quote **\`#${quoteToDrop.quoteId} ${quoteToDrop.quote}\`** was submitted by <@${quoteToDrop.submitterId}>.\nIf you want it removed ask them or a server admin.`);
                    embed.setColor("#ff0000");
                    ephemeral = true;
                    return;
                }

                await quotesSchema
                    .deleteOne({ quoteId })
                    .then(async () => {
                        embed.setDescription(`Quote **\`#${quoteToDrop.quoteId} ${quoteToDrop.quote}\`** has been **permanently deleted**.`);
                        updateChannelName();
                    })
                    .catch((err) => {
                        handleError(err);
                    });
                return;
            }

            await quotesSchema
                .deleteOne({ quoteId })
                .then(async () => {
                    embed.setDescription(`Quote **\`#${quoteToDrop.quoteId} ${quoteToDrop.quote}\`** has been **permanently deleted**.\n(admin mode)`);
                    updateChannelName();
                })
                .catch((err) => {
                    handleError(err);
                });
        };

        const subcommand = `${interaction.options._subcommand.toString()}`;
        const optionalArg = interaction.options._hoistedOptions;

        switch (subcommand) {
            case "list":
                await list();
                break;
            case "add":
                await add(optionalArg[0]?.value, optionalArg[1]?.value);
                break;
            case "edit":
                await edit(optionalArg[0]?.value, optionalArg[1]?.value);
                break;
            case "remove":
                await drop(optionalArg[0]?.value);
                break;
        }

        if (interaction) {
            interaction.reply({
                embeds: [embed],
                ephemeral,
            });
        }
    },
};
