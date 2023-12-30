import { Client, EmbedBuilder, Events, VoiceBasedChannel, VoiceChannel } from "discord.js";
import config from "./config.json";
import VoiceTime from "./models/bot/voiceTime";
import secrets from "./secrets";

interface VoiceState {
    timestamp: number;
    channelId: string;
    incognito: boolean;
}

const voiceStatesMap = new Map<string, VoiceState>();

function groupByChannel() {
    const channelGroups = new Map<string, Array<{ userId: string } & Omit<VoiceState, "channelId">>>();
    voiceStatesMap.forEach(({ timestamp, channelId, incognito }, userId) => {
        if (channelGroups.has(channelId)) channelGroups.get(channelId)!.push({ userId, timestamp, incognito });
        else channelGroups.set(channelId, [{ userId, timestamp, incognito }]);
    });
    return channelGroups;
}

function getStateEmbed() {
    const embed = new EmbedBuilder().setColor("Random").setTitle("⌚ Current VoiceTime state:").setTimestamp();

    if (!voiceStatesMap.size) embed.setDescription("***No server members are currently in a voice channel.***");
    else
        embed.setDescription("\u200B").addFields(
            [...groupByChannel()].flatMap(([channelId, voiceState]) => {
                return voiceState.some((element) => element.incognito)
                    ? []
                    : {
                          name: `> <#${channelId}>`,
                          value: voiceState
                              .flatMap(({ userId, incognito, timestamp }) => (incognito ? [] : `<@${userId}> **→** <t:${Math.floor(timestamp / 1000)}:R>`))
                              .concat("\u200B")
                              .join("\n"),
                          inline: false,
                      };
            })
        );

    return embed;
}

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
    console.log("╔ 💛 \x1b[33mInitializing VoiceTime module...\x1b[0m");

    // Initialize channel time map with current guild voice states
    client.guilds.cache.get(secrets.testGuildId)?.voiceStates.cache.forEach(async (voiceState) =>
        voiceStatesMap.set(voiceState.id, {
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
            voiceStatesMap.set(newState.id, { timestamp: Date.now(), channelId: newState.channel.id, incognito: isIncognitio(newState.channel) });

            updateStateMessage(client, newState.channel);

            return;
        }

        // On leave
        if (oldState.channel && !newState.channel) {
            const joinTime = voiceStatesMap.get(newState.id);
            if (!joinTime) {
                console.log(`joinTime is undefined for ${newState.member?.user.username}`);
                return;
            }

            const timeSpent = Date.now() - joinTime.timestamp;
            voiceStatesMap.delete(newState.id);

            updateStateMessage(client, oldState.channel);

            await VoiceTime.updateOne({ userId: newState.id }, { $inc: { time: timeSpent } }, { upsert: true });
            return;
        }

        // On switch
        if (oldState.channel && newState.channel && oldState.channel.id !== newState.channel.id) {
            let oldStateValue = voiceStatesMap.get(newState.id);
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
    async function cleanup(signal: string | NodeJS.Signals) {
        if (cleanupInProgress) return;
        cleanupInProgress = true;

        console.log(`🔶 \x1b[43m${signal} signal received. Cleaning up...\x1b[0m`);

        await VoiceTime.bulkWrite(
            Array.from(voiceStatesMap.entries()).map(([userId, joinTime]) => {
                return { updateOne: { filter: { userId }, update: { $inc: { time: Date.now() - joinTime.timestamp } }, upsert: true } };
            })
        );
        process.exit(0);
    }

    ["SIGINT", "SIGTERM", "SIGHUP", "SIGBREAK", "SIGUSR1", "SIGUSR2"].forEach((signal) => process.on(signal, cleanup.bind(null, signal)));

    console.log("╚ ☑️  \x1b[35mVoiceTime module has been initialized!\x1b[0m");
}

export const getVoiceTimeState = () => voiceStatesMap as ReadonlyMap<string, VoiceState>;
