const { Client, Events, GatewayIntentBits } = require("discord.js");
require("dotenv").config();
const { DISCORD_TOKEN } = process.env;
const customMathParser = require("./customMathParser")
const parser = new customMathParser()

// Create a new client instance
const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
});

// When the client is ready, run this code (only once)
// We use 'c' for the event parameter to keep it separate from the already defined 'client'
client.once(Events.ClientReady, c => {
  console.log(`Ready! Logged in as ${c.user.tag}`);
});

let n = 1;
client.on(Events.MessageCreate, msg => {
  if (msg.author.bot) return;

  let sentNumber;
  try {
    if (msg.content.startsWith("let ")) {
      fn = parser.evaluate(msg.content.substring(4))
      msg.reply(`defined a function \`${fn?.syntax}\``)
      return;
    } else {
      sentNumber = parser.evaluate(msg.content);
    }
  } catch (e) {
    console.log(e)
    if (e.message.startsWith("Undefined function")) {
      msg.reply(`function ${e.message.split(' ')[2]} is not defined`);
    } else {
      msg.reply("invalid expression");
    }
    return;
  }

  if (sentNumber === n) {
    msg.reply("right, next number is " + ++n);
  } else {
    msg.reply("no, next number is " + n);
  }
});

// Log in to Discord with your client's token
client.login(DISCORD_TOKEN);
