const { REST, Routes, ApplicationCommandOptionType, EmbedBuilder } = require('discord.js');
const { CommandType } = require('wokcommands');
require('dotenv').config();

const fs = require('fs');

const rest = new REST({ version: '10' }).setToken(process.env.CLIENT_TOKEN);

module.exports = {
    description: "Modifies the client's registered slash commands.",
    type: CommandType.SLASH,
    testOnly: true,
    ownerOnly: true,
    options: [
        // LIST
        {
            type: ApplicationCommandOptionType.Subcommand,
            name: 'list',
            description: 'Lists all the registered slash commands.',
        },
        // RELOAD
        {
            type: ApplicationCommandOptionType.Subcommand,
            name: 'reload',
            description: 'Reloads registered slash commands.',
            options: [
                {
                    type: ApplicationCommandOptionType.String,
                    name: 'scope',
                    description: 'Reloads all guild/global scoped commands.',
                    required: true,
                    choices: [
                        { name: 'guild', value: 'guild' },
                        { name: 'global', value: 'global' },
                        { name: 'both', value: 'both' },
                    ],
                },
            ],
        },
        // YEET
        {
            type: ApplicationCommandOptionType.Subcommand,
            name: 'yeet',
            description: 'Removes all registered slash commands.',
            options: [
                {
                    type: ApplicationCommandOptionType.String,
                    name: 'scope',
                    description: 'Reloads all guild/global scoped commands.',
                    required: true,
                    choices: [
                        { name: 'guild', value: 'guild' },
                        { name: 'global', value: 'global' },
                        { name: 'both', value: 'both' },
                    ],
                },
            ],
        },
    ],

    callback: async ({ interaction, client, guild }) => {
        const embed = new EmbedBuilder().setColor('#00ff3c');
        let ephemeral = false;

        const guildCommands = await guild.commands.fetch();
        const globalCommands = await client.application.commands.fetch();

        const handleError = (err) => {
            console.error(err);

            embed.setTitle(`An error occurred while processing your request.\nTry again later or contact a server admin.`);
            embed.setColor('#ff0000');
            ephemeral = true;
        };

        const list = async () => {
            const getCommandsList = (commands) => {
                let string = '';
                const longestCommand = Math.max(...Array.from(commands.values()).map((command) => command.name.length));
                for (const [id, command] of commands) {
                    string += `/${command.name}${Array(longestCommand - command.name.length)
                        .fill(' ')
                        .join('')}   ${id}\n`;
                }
                return string;
            };

            embed.setTitle(`${client.user.username}'s registered slash commands:`);
            embed.setDescription(
                `**═══════ Guild scope for ${guild.name}: ═══════**\`\`\`py\n${getCommandsList(guildCommands)}\`\`\`\n
                **═════════════ Global scope: ═════════════**\`\`\`py\n${getCommandsList(globalCommands)}\`\`\``
            );
            embed.setColor('#00c8ff');
        };

        const reload = async (scope) => {
            // // if (scope === 'guild') {
            // console.log('stage 1\n', guildCommands.keys());
            // await guild.commands.set([]);
            // console.log('stage 2\n', await guild.commands.fetch());
            // const keys = ['name', 'nameLocalizations', 'description', 'nsfw', 'descriptionLocalizations', 'type', 'options', 'defaultMemberPermissions', 'dmPermission'];
            // const obj = {
            //     date: 'Jan',
            //     color: 'Red',
            //     one: 367,
            //     two: 427,
            //     three: 753,
            // };
            // const objCopy = {};
            // keys.forEach((key) => (objCopy[key] = obj[key]));
            // console.log(objCopy);
            // await guild.commands.set(Array.from(guildCommands.values()));
            // console.log('stage 3\n', await guild.commands.fetch());
            // await rest.put(Routes.applicationGuildCommands(client.user.id, guild.id), { body: JSON.stringify(commands) });
            // console.log("stage 3", await rest.get(Routes.applicationGuildCommands(client.user.id, guild.id)));
            // }
            // embed.setTitle("This command ain't ready yet chief");
        };

        const yeet = async (scope) => {
            // for guild-based commands
            if (scope === 'guild') {
                rest.put(Routes.applicationGuildCommands(client.user.id, guild.id), { body: [] });
                embed.setDescription('Succesfully yeeted all **guild** scoped slash commands.');
                return;
            }

            // for global commands
            if (scope === 'global') {
                rest.put(Routes.applicationCommands(client.user.id), { body: [] });
                embed.setDescription('Succesfully yeeted all **global** scoped slash commands.');
                return;
            }

            rest.put(Routes.applicationGuildCommands(client.user.id, guild.id), { body: [] });
            rest.put(Routes.applicationCommands(client.user.id), { body: [] });
            embed.setDescription('Succesfully yeeted all **guild** & **global** scoped slash commands.');
        };

        const subcommand = interaction?.options._subcommand;
        const args = interaction?.options._hoistedOptions;
        switch (subcommand) {
            case 'list':
                try {
                    await list();
                } catch (err) {
                    handleError(err);
                }
                break;
            case 'reload':
                await reload(args[0]?.value);
                break;
            case 'yeet':
                try {
                    await yeet(args[0]?.value);
                } catch (err) {
                    handleError(err);
                }
                break;
        }

        return {
            embeds: [embed],
            ephemeral,
        };
    },
};
