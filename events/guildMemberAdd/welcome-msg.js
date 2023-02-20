const { EmbedBuilder } = require('discord.js');

module.exports = async (member, instance) => {
    const dmEmbed = new EmbedBuilder()
        .setColor('#ff3fec')
        .setAuthor({ name: member.guild.name, iconURL: `https://cdn.discordapp.com/icons/${member.guild.id}/${member.guild.icon}.gif?size=4096`, url: 'https://discord.gg/cHs56zgFBy' })
        .setThumbnail('https://cdn.discordapp.com/attachments/980813644948463656/986291948430164028/mosesSpinHD.gif?size=4096')
        .setTitle(`> :wave: Greetings ${member.user.username}!`)
        .setDescription(
            "My name is **`MosesBot`** and I would like to welcome you to\n**The Moses** ~~Cult~~ ***Club of Mutual Adoration!*** Originally, the server started out as a joke, however with time it just grew an we decided to go with it.\n\n*Missing the* **context** *on why tf you got invited here and don't know what this is all about?*\n Very well then. Gino/Mojżesz/***Moses*** sometimes says some stupid shit, so some dumbass who clearly has too much free time decided to make a discord bot that would store all of Moses' stupid \"quotes\" in a database.\nEvery day at **7:15am** (CET) a random Moses Quote will be sent to the <#980813191556780064> channel. The daily quote message contains a ping. Don't like pings? You can toggle them in <#980839919972921374>.\n\u200B"
        );
    member.send({ embeds: [dmEmbed] });

    const welcomeEmbed = new EmbedBuilder()
        .setColor('Random')
        .setDescription(`> :wave: <@${member.user.id}> **has just joined \`${member.guild.name}\`**!`)
        .setThumbnail(`https://cdn.discordapp.com/avatars/${member.user.id}/${member.user.avatar}.png?size=4096`)
        .addFields({ name: '\u200B', value: '**ONE OF US!**', inline: true }, { name: '\u200B', value: '**ONE OF US!**', inline: true }, { name: '\u200B', value: '**ONE OF US!**', inline: true });

    instance._client.channels.cache.get('986301246048722955').send({ embeds: [welcomeEmbed] });
};
