import { Client, EmbedBuilder, Events } from "discord.js";
import config from "./config.json";
import VoiceTime from "./models/bot/voiceTime";
import secrets from "./secrets";

const voiceTimeMap = new Map<string, number>();

const getStateEmbed = () =>
    new EmbedBuilder()
        .setColor("Random")
        .setTitle("> ⌚ Current VoiceTime state:")
        .setDescription(
            "\u200B\n" +
                (voiceTimeMap.size
                    ? [...voiceTimeMap].map(([userId, joinTime]) => `<@${userId}> **→** <t:${Math.floor(joinTime / 1000)}:R>`).join("\n")
                    : "***No server members are currently in a voice channel.***") +
                "\n\u200B"
        )
        .setTimestamp();

const updateStateMessage = async (client: Client) => {
    const channel = await client.channels.cache
        .get(config.channels.voiceTime)
        ?.fetch()
        .then((channel) => channel as SendableChannel);
    if (!channel) return console.error("VoiceTime channel was not found!");

    const message = await channel.messages.fetch({ limit: 1 }).then((messages) => messages.first());
    if (!message) channel?.send({ embeds: [getStateEmbed()] });
    else message.edit({ embeds: [getStateEmbed()] });
};

export function initializeVoiceTime(client: Client) {
    // Initialize channel time map with current guild voice states
    client.guilds.cache.get(secrets.testGuildId)?.voiceStates.cache.forEach(async (voiceState) => voiceTimeMap.set(voiceState.id, Date.now()));

    // Update state message
    updateStateMessage(client);

    // Track voice time
    client.on(Events.VoiceStateUpdate, async (oldState, newState) => {
        if (oldState.member?.user.bot) return;

        // On join
        if (!oldState.channelId && newState.channelId) {
            voiceTimeMap.set(newState.id, Date.now());

            // Update state message
            updateStateMessage(client);

            return;
        }

        // On leave
        if (oldState.channelId && !newState.channelId) {
            const joinTime = voiceTimeMap.get(newState.id);
            if (!joinTime) {
                console.log(`joinTime is undefined for ${newState.member?.user.username}`);
                return;
            }

            const timeSpent = Date.now() - joinTime;
            voiceTimeMap.delete(newState.id);

            // Update state message
            updateStateMessage(client);

            await VoiceTime.updateOne({ userId: newState.id }, { $inc: { time: timeSpent } }, { upsert: true });
        }
    });

    let cleanupInProgress: boolean = false;
    async function cleanup() {
        if (cleanupInProgress) return;
        cleanupInProgress = true;

        await VoiceTime.bulkWrite(
            Array.from(voiceTimeMap.entries()).map(([userId, joinTime]) => {
                return { updateOne: { filter: { userId }, update: { $inc: { time: Date.now() - joinTime } }, upsert: true } };
            })
        );
        process.exit();
    }

    ["SIGINT", "SIGTERM", "SIGHUP", "SIGBREAK", "SIGUSR1", "SIGUSR2", "uncaughtException", "exit"].forEach((signal) => process.on(signal, cleanup));
}

export const getVoiceTimeState = () => voiceTimeMap as ReadonlyMap<string, number>;
