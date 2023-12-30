import { Client, EmbedBuilder, Events, VoiceBasedChannel, VoiceChannel } from "discord.js";
import config from "./config.json";
import VoiceTime from "./models/bot/voiceTime";
import secrets from "./secrets";

interface VoiceState {
    timestamp: number;
    channelId: string;
    incognito: boolean;
}

const voiceStateMap = new Map<string, VoiceState>();

const getStateEmbed = () =>
    new EmbedBuilder()
        .setColor("Random")
        .setTitle("> ⌚ Current VoiceTime state:")
        .setDescription(
            "\u200B\n" +
                (voiceStateMap.size
                    ? [...voiceStateMap]
                          .flatMap(([userId, { incognito, channelId, timestamp }]) => (incognito ? [] : `<@${userId}> **in** <#${channelId}> **→** <t:${Math.floor(timestamp / 1000)}:R>`))
                          .join("\n")
                    : "***No server members are currently in a voice channel.***") +
                "\n\u200B"
        )
        .setTimestamp();

// Update state message if the user was not in incognito channel
async function updateStateMessage(client: Client, voiceChannel?: VoiceBasedChannel) {
    if (voiceChannel && isIncognitio(voiceChannel)) return;
    const messageChannel = await client.channels.cache
        .get(config.channels.voiceTime)
        ?.fetch()
        .then((channel) => channel as SendableChannel);
    if (!messageChannel) return console.error("VoiceTime channel was not found!");

    const message = await messageChannel.messages.fetch({ limit: 1 }).then((messages) => messages.first());
    if (!message) messageChannel?.send({ embeds: [getStateEmbed()] });
    else message.edit({ embeds: [getStateEmbed()] });
}

// Check if a voice channel is incognito
function isIncognitio(channel: VoiceBasedChannel | undefined) {
    if (!channel || !channel.isVoiceBased()) return false;
    return channel.name.toLowerCase().includes("🥸");
}

export function initializeVoiceTime(client: Client) {
    // Initialize channel time map with current guild voice states
    client.guilds.cache.get(secrets.testGuildId)?.voiceStates.cache.forEach(async (voiceState) =>
        voiceStateMap.set(voiceState.id, {
            timestamp: Date.now(),
            channelId: voiceState.channelId!,
            incognito: isIncognitio(voiceState.guild.channels.cache.get(voiceState.channelId!) as VoiceChannel),
        })
    );

    updateStateMessage(client);

    // Track voice time
    client.on(Events.VoiceStateUpdate, async (oldState, newState) => {
        if (oldState.member?.user.bot) return;

        // On join
        if (!oldState.channel && newState.channel) {
            voiceStateMap.set(newState.id, { timestamp: Date.now(), channelId: newState.channel.id, incognito: isIncognitio(newState.channel) });

            updateStateMessage(client, newState.channel);

            return;
        }

        // On leave
        if (oldState.channel && !newState.channel) {
            const joinTime = voiceStateMap.get(newState.id);
            if (!joinTime) {
                console.log(`joinTime is undefined for ${newState.member?.user.username}`);
                return;
            }

            const timeSpent = Date.now() - joinTime.timestamp;
            voiceStateMap.delete(newState.id);

            updateStateMessage(client, oldState.channel);

            await VoiceTime.updateOne({ userId: newState.id }, { $inc: { time: timeSpent } }, { upsert: true });
            return;
        }

        // On switch
        if (oldState.channel && newState.channel) {
            let oldStateValue = voiceStateMap.get(newState.id);
            if (oldStateValue) {
                oldStateValue.incognito = isIncognitio(newState.channel);
                oldStateValue.channelId = newState.channel.id;

                if (!isIncognitio(oldState.channel) || !isIncognitio(newState.channel)) updateStateMessage(client);
            }
        }
    });

    client.on(Events.MessageCreate, (message) => {
        if (message.channelId === config.channels.voiceTime && message.author.id !== client.user?.id && message.deletable) message.delete();
    });

    let cleanupInProgress: boolean = false;
    async function cleanup() {
        if (cleanupInProgress) return;
        cleanupInProgress = true;

        await VoiceTime.bulkWrite(
            Array.from(voiceStateMap.entries()).map(([userId, joinTime]) => {
                return { updateOne: { filter: { userId }, update: { $inc: { time: Date.now() - joinTime.timestamp } }, upsert: true } };
            })
        );
        process.exit(0);
    }

    ["SIGINT", "SIGTERM", "SIGHUP", "SIGBREAK", "SIGUSR1", "SIGUSR2"].forEach((signal) => process.on(signal, cleanup));
}

export const getVoiceTimeState = () => voiceStateMap as ReadonlyMap<string, VoiceState>;
