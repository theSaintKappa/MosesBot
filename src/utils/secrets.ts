interface Secrets {
    environment: "production" | "development" | string;
    discordToken: string;
    mongoUri: string;
    githubToken: string;
    testGuildId: string;
    gcp: {
        project_id: string;
        private_key: string;
        client_email: string;
        bucket_name: string;
    };
}

const secrets: Secrets = {
    environment: process.env.NODE_ENV ?? "production",
    discordToken: process.env.DISCORD_TOKEN ?? "",
    mongoUri: process.env.MONGO_URI ?? "",
    githubToken: process.env.GITHUB_TOKEN ?? "",
    testGuildId: process.env.TEST_GUILD_ID ?? "",
    gcp: {
        project_id: process.env.GCP_PROJECT_ID ?? "",
        client_email: process.env.GCP_SERVICE_ACCOUNT_EMAIL ?? "",
        private_key: process.env.GCP_PRIVATE_KEY?.replace(/\\n/g, "\n") ?? "",
        bucket_name: process.env.GCP_BUCKET_NAME ?? "",
    },
};

if (Object.values(secrets).includes("") || Object.values(secrets.gcp).includes("")) throw new Error("Not all environment variables are set.");

export default secrets;
