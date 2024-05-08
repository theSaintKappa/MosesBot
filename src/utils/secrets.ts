interface Secrets {
    environment: "production" | "development";
    discordToken: string;
    mongoUri: string;
    githubToken: string;
    testGuildId: string;
    googleCredentials: {
        type: string;
        project_id: string;
        private_key_id: string;
        private_key: string;
        client_email: string;
        client_id: string;
        universe_domain: string;
        bucket_name: string;
    };
}

const secrets: Secrets = {
    environment: process.env.NODE_ENV === "production" ? "production" : "development",
    discordToken: process.env.DISCORD_TOKEN ?? "",
    mongoUri: process.env.MONGO_URI ?? "",
    githubToken: process.env.GITHUB_TOKEN ?? "",
    testGuildId: process.env.TEST_GUILD_ID ?? "",
    googleCredentials: {
        type: process.env.GOOGLE_TYPE ?? "",
        project_id: process.env.GOOGLE_PROJECT_ID ?? "",
        private_key_id: process.env.GOOGLE_PRIVATE_KEY_ID ?? "",
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n") ?? "",
        client_email: process.env.GOOGLE_CLIENT_EMAIL ?? "",
        client_id: process.env.GOOGLE_CLIENT_ID ?? "",
        universe_domain: process.env.GOOGLE_UNIVERSE_DOMAIN ?? "",
        bucket_name: process.env.GOOGLE_BUCKET_NAME ?? "",
    },
};

if (Object.values(secrets).includes("") || Object.values(secrets.googleCredentials).includes("")) throw new Error("Not all environment variables are set.");

export default secrets;
