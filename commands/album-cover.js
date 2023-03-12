const { ApplicationCommandOptionType, AttachmentBuilder } = require('discord.js');
const { CommandType } = require('wokcommands');
const axios = require('axios');

module.exports = {
    description: 'Every image can be an album cover!',
    type: CommandType.SLASH,
    testOnly: true,
    options: [
        {
            name: 'image',
            description: 'Provide an image.',
            required: true,
            type: ApplicationCommandOptionType.Attachment,
        },
    ],

    callback: async ({ interaction }) => {
        interaction.deferReply();

        const res = await axios.post('https://api.saintkappa.xyz/albumCover', { url: interaction.options._hoistedOptions[0]?.attachment.url }, { responseType: 'arraybuffer' });

        const attachment = new AttachmentBuilder(res.data);

        interaction.editReply({ content: '> Here is your generated album cover.', files: [attachment] });
    },
};
