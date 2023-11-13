interface Secrets {
    discordToken: string;
    mongoUri: string;
    githubToken: string;
    testGuildId: string;
}

const secrets: Secrets = {
    discordToken: process.env.DISCORD_TOKEN ?? "",
    mongoUri: process.env.MONGO_URI ?? "",
    githubToken: process.env.GITHUB_TOKEN ?? "",
    testGuildId: process.env.TEST_GUILD_ID ?? "",
};

if (Object.values(secrets).includes("")) throw new Error("Not all environment variables are set.");

export default secrets;
