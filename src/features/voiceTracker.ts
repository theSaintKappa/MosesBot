import { Client, EmbedBuilder, Events, Snowflake, VoiceBasedChannel } from "discord.js";
import config from "../config.json";
import VoiceTime from "../models/bot/voiceTime";
import secrets from "../utils/secrets";

// Groupped by user id
interface UserVoiceState {
    channelId: Snowflake;
    joinTime: Date;
    incognito: boolean;
    afk: boolean;
}

// Groupped by channel id
type ChannelVoiceStates = Array<{ userId: Snowflake } & Omit<UserVoiceState, "channelId">>;

const voiceStatesMap = new Map<Snowflake, UserVoiceState>();

function groupVoiceStatesByChannel() {
    const channelGroups = new Map<Snowflake, ChannelVoiceStates>();

    voiceStatesMap.forEach(({ channelId, joinTime, incognito, afk }, userId) =>
        channelGroups.has(channelId) ? channelGroups.get(channelId)!.push({ userId, joinTime, incognito, afk }) : channelGroups.set(channelId, [{ userId, joinTime, incognito, afk }])
    );

    return channelGroups;
}

export function getStateEmbed() {
    const embed = new EmbedBuilder().setColor("Random").setTitle("⌚ Current VoiceTime state:").setTimestamp();

    voiceStatesMap.size
        ? embed.setDescription("\u200B").addFields(
              [...groupVoiceStatesByChannel()].flatMap(([channelId, voiceStates]) =>
                  !voiceStates.some((voiceState) => voiceState.incognito)
                      ? {
                            name: `> <#${channelId}> **(${voiceStates.length})**`,
                            value: voiceStates
                                .flatMap(({ userId, joinTime, incognito, afk }) => (!incognito ? `<@${userId}> **→** <t:${Math.floor(joinTime.getTime() / 1000)}:R> ${afk ? "💤" : ""}` : []))
                                .concat("\u200B")
                                .join("\n"),
                            inline: false,
                        }
                      : []
              )
          )
        : embed.setDescription("***No server members are currently in a voice channel.***");

    return embed;
}

// Update state message if the user was not in incognito channel
async function updateStateMessage(channel: SendableChannel) {
    const message = await channel.messages.fetch({ limit: 1 }).then((messages) => messages.first());
    message ? message.edit({ embeds: [getStateEmbed()] }) : channel.send({ embeds: [getStateEmbed()] });
}

// Check if a voice channel is incognito or afk
const isIncognitio = (channel: VoiceBasedChannel) => channel.name.includes("🥸");
const isAfk = (channel: VoiceBasedChannel) => channel.name.includes("💤");

function joinEvent(userId: Snowflake, newChannel: VoiceBasedChannel) {
    voiceStatesMap.set(userId, { channelId: newChannel.id, joinTime: new Date(), incognito: isIncognitio(newChannel), afk: isAfk(newChannel) });
}

async function leaveEvent(userId: Snowflake, oldChannel: VoiceBasedChannel) {
    const voiceState = voiceStatesMap.get(userId);
    if (!voiceState) return;

    if (!isAfk(oldChannel)) await VoiceTime.updateOne({ userId }, { $inc: { time: Date.now() - voiceState.joinTime.getTime() } }, { upsert: true });

    voiceStatesMap.delete(userId);
}

async function switchEvent(userId: Snowflake, newChannel: VoiceBasedChannel, oldChannel: VoiceBasedChannel) {
    const voiceState = voiceStatesMap.get(userId);
    if (!voiceState) return;

    if (!isAfk(oldChannel)) await VoiceTime.updateOne({ userId }, { $inc: { time: Date.now() - voiceState.joinTime.getTime() } }, { upsert: true });

    voiceStatesMap.set(userId, { channelId: newChannel.id, joinTime: new Date(), incognito: isIncognitio(newChannel), afk: isAfk(newChannel) });
}

export function initializeVoiceTime(client: Client) {
    console.log("╔ 💛 \x1b[33mInitializing VoiceTime module...\x1b[0m");

    const infoChannel = client.channels.cache.get(config.channels.voiceTime) as SendableChannel;

    // Initialize channel time map with all current guild voice states
    client.guilds.cache.get(secrets.testGuildId)?.voiceStates.cache.forEach(({ id, channelId, channel }) => {
        voiceStatesMap.set(id, { channelId: channelId!, joinTime: new Date(), incognito: isIncognitio(channel!), afk: isAfk(channel!) });
    });

    updateStateMessage(infoChannel);

    // Voice channel events
    client.on(Events.VoiceStateUpdate, async (oldState, newState) => {
        if (oldState.member?.user.bot) return;

        if (!oldState.channel && newState.channel) joinEvent(newState.id, newState.channel);
        else if (oldState.channel && !newState.channel) leaveEvent(oldState.id, oldState.channel);
        else if (oldState.channel && newState.channel && oldState.channelId !== newState.channelId) switchEvent(newState.id, newState.channel, oldState.channel);

        updateStateMessage(infoChannel);
    });

    client.on(Events.MessageCreate, (message) => {
        if (message.channelId === config.channels.voiceTime && message.author.id !== client.user?.id && message.deletable) message.delete();
    });

    let cleanupInProgress = false;
    async function cleanup(signal: string | NodeJS.Signals) {
        if (cleanupInProgress) return;
        cleanupInProgress = true;

        console.log(`🔶 \x1b[43m${signal} signal received. Cleaning up...\x1b[0m`);

        const now = Date.now();
        const updates = [...voiceStatesMap].map(([userId, { joinTime }]) => {
            return { updateOne: { filter: { userId }, update: { $inc: { time: now - joinTime.getTime() } }, upsert: true } };
        });

        await VoiceTime.bulkWrite(updates);
        process.exit(0);
    }

    ["SIGINT", "SIGTERM", "SIGHUP", "SIGBREAK", "SIGUSR1", "SIGUSR2"].forEach((signal) => process.on(signal, cleanup.bind(null, signal)));

    console.log("╚ ☑️  \x1b[35mVoiceTime module has been initialized!\x1b[0m");
}

export const getVoiceTimeState = () => voiceStatesMap as ReadonlyMap<Snowflake, UserVoiceState>;
