import { type Interface, createInterface } from "node:readline/promises";
import config from "@/config.json";
import type { IVoiceTime } from "@/db";
import VoiceTime from "@/models/bot/voiceTime";
import { logger } from "@/utils/logger";
import secrets from "@/utils/secrets";
import { type Client, EmbedBuilder, Events, type Message, type Snowflake, type VoiceBasedChannel } from "discord.js";

interface VoiceState {
    userId: Snowflake;
    channelId: Snowflake;
    joinTimestamp: Date;
    isIncognito: boolean;
    isAfk: boolean;
}

const log = logger("VoiceTime");

const voiceStates = new Map<Snowflake, VoiceState>();

let lastLeaderboardUpdate = 0;

const displayEmbeds = {
    leaderboard: new EmbedBuilder().setDescription("***Loading leaderboard...***"),
    facts: new EmbedBuilder().setDescription("***Loading facts...***"),
    state: new EmbedBuilder().setDescription("***Loading state...***"),
};

export function getLeaderboardEmbed(voiceTime: IVoiceTime[]) {
    const medals = ["🥇", "🥈", "🥉"];
    const embed = new EmbedBuilder()
        .setColor("#ffc70e")
        .setTitle("> 🏆 Voice time leaderboard:")
        .addFields(
            { name: "\u200B", value: `${voiceTime.map((_, i) => medals[i] ?? `**\`${i + 1}\`**`).join("\n")}\n\u200B`, inline: true },
            { name: "\u200B", value: voiceTime.map(({ userId }) => `\`\u200B\`<@${userId}>`).join("\n"), inline: true },
            { name: "\u200B", value: voiceTime.map(({ time }) => `**\`${(time / 1000 / 60 / 60).toFixed(2)} hours\`**`).join("\n"), inline: true },
        )
        .setTimestamp();

    return embed;
}

function getFactsEmbed(voiceTime: IVoiceTime[]) {
    const time = voiceTime[0].time + (Date.now() - (voiceStates.get(voiceTime[0].userId)?.joinTimestamp.getTime() ?? Date.now()));

    const embed = new EmbedBuilder()
        .setColor("#1869ff")
        .setTitle("> 📊 Stats:")
        .setDescription(`***### As <@${voiceTime[0].userId}> was connected to a voice channel:***
        🌍 The earth has traveled **\`${Number.parseFloat(((time / 1000) * 29.78).toFixed(2)).toLocaleString()} km\`** around the sun
        👁️ The average human has blinked **\`${Math.ceil((time / 1000) * 0.28).toLocaleString()} times\`**
        🍼 Around **\`${Math.ceil((time / 1000) * 4.32).toLocaleString()}\`** babies were born in the world
        🥴 Moses has drunken approximately **\`${((time / 1000 / 60 / 60 / 24) * 2).toFixed(2)} liters\`** of vodka\n\u200B`)
        .setTimestamp();

    return embed;
}

export function getStateEmbed() {
    const embed = new EmbedBuilder().setColor("#ff245e").setTitle("> ⌚ Voice time state:").setTimestamp();

    const grouppedChannelStates = new Map<Snowflake, Array<{ userId: Snowflake } & Omit<VoiceState, "channelId">>>();
    for (const { userId, channelId, joinTimestamp, isIncognito, isAfk } of voiceStates.values()) {
        if (isIncognito) continue;
        grouppedChannelStates.has(channelId) ? grouppedChannelStates.get(channelId)?.push({ userId, joinTimestamp, isIncognito, isAfk }) : grouppedChannelStates.set(channelId, [{ userId, joinTimestamp, isIncognito, isAfk }]);
    }

    if ([...voiceStates.values()].filter(({ isIncognito }) => !isIncognito).length)
        embed.setDescription("\u200B").addFields(
            [...grouppedChannelStates].flatMap(([channelId, voiceStates]) => {
                return {
                    name: `> <#${channelId}> **(${voiceStates.length})**`,
                    value: voiceStates
                        .flatMap(({ userId, joinTimestamp, isAfk }) => `<@${userId}> **→** <t:${Math.floor(joinTimestamp.getTime() / 1000)}:R> ${isAfk ? "💤" : ""}`)
                        .concat("\u200B")
                        .join("\n"),
                    inline: false,
                };
            }),
        );
    else embed.setDescription("***No server members are currently in a voice channel.***");

    displayEmbeds.state = embed;
    return embed;
}

async function updateStateDisplay(message: Message<true>) {
    displayEmbeds.state = getStateEmbed();
    message.edit({ embeds: Object.values(displayEmbeds) });
}

async function updateLeaderboardDisplay(message: Message<true>) {
    const voiceTime = await VoiceTime.find().sort({ time: -1 });

    displayEmbeds.leaderboard = getLeaderboardEmbed(voiceTime);
    displayEmbeds.facts = getFactsEmbed(voiceTime);
    message.edit({ embeds: Object.values(displayEmbeds) });
    lastLeaderboardUpdate = Date.now();
}

const isIncognitio = (channel: VoiceBasedChannel) => channel.name.includes("🥸");
const isAfk = (channel: VoiceBasedChannel) => channel.name.includes("💤");

function joinEvent(userId: Snowflake, newChannel: VoiceBasedChannel) {
    voiceStates.set(userId, { userId, channelId: newChannel.id, joinTimestamp: new Date(), isIncognito: isIncognitio(newChannel), isAfk: isAfk(newChannel) });
}

async function leaveEvent(userId: Snowflake, oldChannel: VoiceBasedChannel) {
    const { ...voiceState } = voiceStates.get(userId);
    if (!voiceState) return;

    voiceStates.delete(userId);
    if (!isAfk(oldChannel)) await VoiceTime.updateOne({ userId }, { $inc: { time: Date.now() - voiceState.joinTimestamp.getTime() } }, { upsert: true });
}

async function switchEvent(userId: Snowflake, newChannel: VoiceBasedChannel, oldChannel: VoiceBasedChannel) {
    const { ...voiceState } = voiceStates.get(userId);
    if (!voiceState) return;

    voiceStates.set(userId, { userId, channelId: newChannel.id, joinTimestamp: new Date(), isIncognito: isIncognitio(newChannel), isAfk: isAfk(newChannel) });
    if (!isAfk(oldChannel)) await VoiceTime.updateOne({ userId }, { $inc: { time: Date.now() - voiceState.joinTimestamp.getTime() } }, { upsert: true });
}

export async function initializeVoiceTime(client: Client, displayChannel: SendableChannel) {
    const guildVoiceStates = client.guilds.cache.get(secrets.testGuildId)?.voiceStates.cache.values() ?? [];
    for (const { id, channelId, channel } of guildVoiceStates) {
        voiceStates.set(id, { userId: id, channelId: channelId as Snowflake, joinTimestamp: new Date(), isIncognito: isIncognitio(channel as VoiceBasedChannel), isAfk: isAfk(channel as VoiceBasedChannel) });
    }

    let displayMessage = await displayChannel.messages.fetch({ limit: 1 }).then((messages) => messages.first());
    if (!displayMessage?.editable) displayMessage = await displayChannel.send({ embeds: Object.values(displayEmbeds) });

    updateStateDisplay(displayMessage);
    updateLeaderboardDisplay(displayMessage);

    client.on(Events.VoiceStateUpdate, async (oldState, newState) => {
        if (oldState.member?.user.bot) return;

        if (!oldState.channel && newState.channel) joinEvent(newState.id, newState.channel);
        else if (oldState.channel && !newState.channel) leaveEvent(oldState.id, oldState.channel);
        else if (oldState.channel && newState.channel && oldState.channelId !== newState.channelId) switchEvent(newState.id, newState.channel, oldState.channel);
        else return;

        updateStateDisplay(displayMessage);
        if (Date.now() - lastLeaderboardUpdate > 60_000) updateLeaderboardDisplay(displayMessage);
    });

    client.on(Events.MessageCreate, (message) => {
        if (message.channelId === config.channels.voiceTime && message.author.id !== client.user?.id && message.deletable) message.delete();
    });

    log.info(`Registered ${voiceStates.size} new voice state(s).`);
}

async function cleanup(signal: NodeJS.Signals | string) {
    log.warn(`Received ${signal}. Running cleanup...`);

    const now = Date.now();
    const updates = [...voiceStates].map(([userId, { joinTimestamp }]) => {
        return { updateOne: { filter: { userId }, update: { $inc: { time: now - joinTimestamp.getTime() } }, upsert: true } };
    });
    if (!updates.length) return log.success("Cleanup finished. No users to update.");

    try {
        const result = await VoiceTime.bulkWrite(updates);
        log.success(`Cleanup finished. Updated ${result.modifiedCount + result.upsertedCount} user(s).`);
    } catch (err) {
        log.error(`Cleanup failed: ${err}`);
    }
}

export const getStates = () => voiceStates as ReadonlyMap<Snowflake, VoiceState>;

let processOrInterface: NodeJS.Process | Interface;

// @ts-expect-error
if (process.platform === "win32") processOrInterface = createInterface({ input: process.stdin, output: process.stdout });
else processOrInterface = process;

for (const signal of ["SIGINT", "SIGTERM", "SIGHUP"]) {
    processOrInterface.on(signal, async () => {
        await cleanup(signal);
        process.exit(0);
    });
}
