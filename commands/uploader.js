const { ApplicationCommandOptionType, EmbedBuilder } = require('discord.js');
const uploadersWhitelistSchema = require('../models/pics-uploaders-whitelist-schema');
const picsWitelist = require('../pics-whitelist');
const { CommandType } = require('wokcommands');

module.exports = {
    description: 'Manege the Moses pics uploaders whitelist.',
    type: CommandType.SLASH,
    testOnly: true,
    ownerOnly: true,
    options: [
        {
            type: ApplicationCommandOptionType.Subcommand,
            name: 'add',
            description: 'Add a user to the pics uploaders whitelist.',
            options: [
                {
                    name: 'user',
                    description: 'Choose the user to add to the whitelist.',
                    type: ApplicationCommandOptionType.User,
                    required: true,
                },
            ],
        },
        {
            type: ApplicationCommandOptionType.Subcommand,
            name: 'remove',
            description: 'Remove a user from the pics uploaders whitelist.',
            options: [
                {
                    name: 'user',
                    description: 'Choose the user you want to remove from the whitelist.',
                    type: ApplicationCommandOptionType.User,
                    required: true,
                },
            ],
        },
    ],

    callback: async ({ interaction, user, args, client }) => {
        const embed = new EmbedBuilder();
        const userArg = interaction?.options._hoistedOptions[0].user;
        const subcommand = interaction?.options._subcommand;
        const userExists = (await uploadersWhitelistSchema.findOne({ 'user.id': userArg.id }).limit(1)) !== null;

        const add = async () => {
            if (userExists) {
                embed.setDescription(`<@${userArg.id}> is already on the pics uploaders whitelist.`).setColor('#ff0000');
                return { embeds: [embed], ephemeral: true };
            }

            await new uploadersWhitelistSchema({
                user: { id: userArg.id, username: userArg.username },
                addedBy: { id: user.id, username: user.username },
            }).save();

            await picsWitelist.fetch();

            await userArg.send(
                `> ***Hey there ${userArg.username}!***\n> <@${user.id}> just added you to the Moses pics uploaders whitelist.\n> You can now send all your smoking hot Moses pics in **this** very channel and they will be automatically uploaded to the database!`
            );

            embed.setDescription(`**[**:heavy_plus_sign:**]** Added <@${userArg.id}> to the pics uploaders whitelist!`).setColor('#00ff00');
            return { embeds: [embed], ephemeral: false };
        };

        const remove = async () => {
            if (!userExists) {
                embed.setDescription(`<@${userArg.id}> is not on the pics uploaders whitelist.`).setColor('#ff0000');
                return { embeds: [embed], ephemeral: true };
            }

            await uploadersWhitelistSchema.deleteOne({ 'user.id': userArg.id });
            embed.setDescription(`**[**:heavy_minus_sign:**]** Removed <@${userArg.id}> from the pics uploaders whitelist.`).setColor('#00ff00');
            await picsWitelist.fetch();
            return { embeds: [embed], ephemeral: false };
        };

        const handleError = () => {
            console.log(err);
            embed.setDescription(`An error occured while adding user to the whitelist.`).setColor('#ff0000');
            return { embeds: [embed], ephemeral: true };
        };

        switch (subcommand) {
            case 'add':
                try {
                    return await add();
                } catch (err) {
                    return handleError();
                }
            case 'remove':
                try {
                    return await remove();
                } catch (err) {
                    return handleError();
                }
        }
    },
};
