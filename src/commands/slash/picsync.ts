import { CommandScope, type SlashCommandObject } from "@/commands/types";
import { bucket } from "@/gcs";
import { MosesPic } from "@/models/moses/pics";
import { EmbedBuilder, PermissionFlagsBits, SlashCommandBuilder } from "discord.js";

export default {
    builder: new SlashCommandBuilder().setName("picsync").setDescription("Check sync between MongoDB and Google Storage").setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    scope: CommandScope.Guild,

    run: async (interaction) => {
        const documents = await MosesPic.find();

        const prefix = "moses/";
        const objects = await bucket.getFiles({ prefix }).then((res) => res[0].filter((file) => file.name !== prefix).map((file) => file.name.slice(prefix.length)));

        const embeds = [new EmbedBuilder().setColor("Blurple").setTitle("🖼️ Moses Pic Sync Status:").setDescription(`**MongoDB**: \`${documents.length} documents\`\n**Bucket**: \`${objects.length} objects\``)];

        const dbMissing = objects.filter((object) => !documents.some((document) => document.id === object));
        const gsMissing = documents.filter((document) => !objects.some((object) => object === document.id));

        if (dbMissing.length === 0 && gsMissing.length === 0) embeds.push(new EmbedBuilder().setColor("Green").setDescription("✅ Everything is in sync!"));

        if (dbMissing.length > 0) embeds.push(new EmbedBuilder().setColor("Red").setDescription(`❌ Found ${dbMissing.length} pic(s) present in Bucket but missing in MongoDB.\n**CDN links**: ${dbMissing.map((id) => `[${id}](https://cdn.saintkappa.dev/moses/${id})`).join(", ")}`));

        if (gsMissing.length > 0) embeds.push(new EmbedBuilder().setColor("Red").setDescription(`❌ Found ${gsMissing.length} pic(s) present in MongoDB but missing in Bucket.\n**API links**: ${gsMissing.map((doc) => `[${doc.id}](https://api.saintkappa.dev/moses/pics?id=${doc.id})`).join(", ")}`));

        interaction.deferred ? await interaction.editReply({ embeds }) : await interaction.reply({ embeds });
    },
} as SlashCommandObject;
