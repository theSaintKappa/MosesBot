const { EmbedBuilder, ApplicationCommandOptionType } = require("discord.js");
const { CommandType } = require("wokcommands");

module.exports = {
    description: "Wish everyone a good night sleep!",
    type: CommandType.SLASH,
    testOnly: true,
    options: [
        {
            name: "optional-message",
            description: "Provide an optional message to add to the good night wishes.",
            required: false,
            type: ApplicationCommandOptionType.String,
        },
    ],

    callback: async ({ interaction, channel, user, text }) => {
        const gnMessage = `<@${user.id}> Wanted to wish you a good night sleep!`;

        const embed = new EmbedBuilder().setColor("Random");

        if (interaction) {
            if (text !== "") {
                embed.setDescription(`You just wished the whole server a good night sleep\nand told them ~~to go fuck themselves~~ **${text}**`);
                interaction.reply({
                    embeds: [embed],
                    ephemeral: true,
                });
                embed.setDescription(`**${gnMessage}\nHe also has something to share with you:\n\`${text}\`**`);
                const message = await channel.send({
                    embeds: [embed],
                    fetchReply: true,
                });
                message.react(":mosesThonk:981867313806602241");

                return;
            }
            embed.setDescription(`You just wished the whole server a good night sleep`);
            interaction.reply({
                embeds: [embed],
                ephemeral: true,
            });
            embed.setDescription(`**${gnMessage}**`);
            const message = await channel.send({
                embeds: [embed],
                fetchReply: true,
            });
            message.react(":mosesThonk:981867313806602241");
        }
    },
};
