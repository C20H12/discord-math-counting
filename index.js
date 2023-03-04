const { Client, Events, GatewayIntentBits } = require("discord.js");
require("dotenv").config();
const { DISCORD_TOKEN } = process.env;

const CustomMathParser = require("./CustomMathParser");
const parser = new CustomMathParser();

const SimpleDb = require("./SimpleDb");
const isTesting = true; // change to false so it won't clear the data file on run
const countingProgressData = new SimpleDb("progress.txt", isTesting)

// Create a new client instance
const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
});

// When the client is ready, run this code (only once)
client.once(Events.ClientReady, c => {
  console.log(`Ready! Logged in as ${c.user.tag}`);
});

// Run on every message sent
client.on(Events.MessageCreate, async msg => {
  if (msg.author.bot) return;
  
  const savedNumber = await countingProgressData.popValue(msg.channelId) ?? 1;
  const number = parseInt(savedNumber, 10);

  console.log(msg.channelId, number)
  countingProgressData.insertValue(msg.channelId, number + 1)
});

// Log in to Discord with your client's token
client.login(DISCORD_TOKEN);
