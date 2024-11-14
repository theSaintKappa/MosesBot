import { CommandScope, type SlashCommandObject } from "@/commands/types";
import { BotPresence } from "@/models/BotPresence";
import { CockpitLog } from "@/models/CockpitLog";
import { ActivityType, type ClientPresenceStatus, type CommandInteractionOptionResolver, SlashCommandBuilder } from "discord.js";

const presenceTypes = [
    { name: "Playing", value: "0" },
    { name: "Streaming", value: "1" },
    { name: "Listening to", value: "2" },
    { name: "Watching", value: "3" },
    { name: "Custom", value: "4" },
    { name: "Competing in", value: "5" },
];

export default {
    builder: new SlashCommandBuilder()
        .setName("presence")
        .setDescription("Change the bot's status.")
        .addStringOption((option) =>
            option
                .setName("type")
                .setDescription("An activity type.")
                .setRequired(true)
                .setChoices(...presenceTypes),
        )
        .addStringOption((option) => option.setName("name").setDescription("The activity's name.").setRequired(true))
        .addStringOption((option) => option.setName("status").setDescription("The bot's status.").setRequired(true).setChoices({ name: "Online", value: "online" }, { name: "Idle", value: "idle" }, { name: "Do Not Disturb", value: "dnd" }, { name: "Invisible", value: "invisible" })),

    scope: CommandScope.Guild,

    run: async (interaction) => {
        const args = <CommandInteractionOptionResolver>interaction.options;
        const type: ActivityType = Number(args.getString("type") as string);
        const name: string = args.getString("name") as string;
        const status = args.getString("status") as ClientPresenceStatus;
        const oldPresence = await BotPresence.findOne();

        interaction.client.user?.setPresence({ activities: [{ type, name }], status });

        const newPresence = await BotPresence.findOneAndUpdate({}, { type, name, status }, { upsert: true, new: true });

        await CockpitLog.create({
            action: "presence_change",
            invokerId: interaction.user.id,
            metadata: { oldPresence: { type: presenceTypes[oldPresence?.type as number].name, name: oldPresence?.name, status: oldPresence?.status }, newPresence: { type: presenceTypes[newPresence.type].name, name: newPresence.name, status: newPresence.status } },
        });

        await interaction.reply({ content: `> Client presence set to "**${type !== ActivityType.Custom ? `${ActivityType[type]} ` : ""}${name}**" (${status})` });
    },
} as SlashCommandObject;
