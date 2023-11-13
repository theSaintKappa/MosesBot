# MosesBot

#### A Discord bot named after my friend Moses

<br>

## Installation

1. Install [Bun](https://bun.sh/)
2. Clone the repository & `cd` into it
3. Run `$ bun install` to install dependencies
4. Create a file named `.env` in the root directory and add the following:

```yaml
DISCORD_TOKEN=your_token # A Discord bot token
MONGO_URI=your_mongodb_uri # A MongoDB connection uri
GITHUB_TOKEN=your_token # A GitHub personal access token with the `public_repo` scope
TEST_GUILD_ID=your_guild_id # A Discord guild id for testing slash commands
```

5. Finally, start the bot with `$ bun run src/index.ts`
