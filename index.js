const { Client, Events, GatewayIntentBits, Message } = require("discord.js");
require("dotenv").config();
const { DISCORD_TOKEN } = process.env;

const CustomMathParser = require("./CustomMathParser");

const SimpleDb = require("./SimpleDb");
const isTesting = false; // change to false so it won't clear the data file on run

const countingProgressData = new SimpleDb("./dataFiles/progress.txt", isTesting);
const countingChannelData = new SimpleDb("./dataFiles/channels.txt", isTesting);

const helpString = require("./help")

// Create a new client instance
const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
});

// When the client is ready, run this code (only once)
client.once(Events.ClientReady, c => {
  console.log(`Ready! Logged in as ${c.user.tag}`);
});


const PREFIX = "mc";

/**
 * handler for messages sent
 * @param {Message} msg 
 * @returns 
 */
const onMessageHandler = async msg => {
  if (msg.author.bot || msg.content.startsWith("//")) return;

  if (msg.content.startsWith(`${PREFIX} setup`)) {
    const setChannelRes = await countingChannelData.insertValue(msg.guildId, msg.channelId);
    if (setChannelRes) {
      msg.reply(`Successfully set active channel to <#${msg.channelId}>`);
    } else {
      msg.reply(`Failed to set active channel to <#${msg.channelId}>`);
    }
    return;
  }

  const activeChannelId = await countingChannelData.getValue(msg.guildId);
  if (activeChannelId === null) {
    msg.reply("Go to a channel and enter `mc setup` to begin.");
    return;
  }
  if (msg.channelId !== activeChannelId) {
    return;
  }

  const message = msg.content;

  const commands = [`def`, `remove`, `listvars`, `help`];
  if (message.includes(PREFIX) && !commands.includes(message.split(`${PREFIX} `)[1].split(" ")[0])) {
    await msg.reply(`Invalid command. Type \`${PREFIX} help\` for help.`);
    return;
  }

  const userMathParser = await new CustomMathParser(msg.author.id);
  
  if (message.startsWith(`${PREFIX} def `)) {
    const defineExpression = message.split(`${PREFIX} def `)[1];
    const [defineRes, defineErr] = userMathParser.define(defineExpression);
    if (defineRes) {
      await msg.reply(`Successfully defined \`${defineExpression.split(/\s*?=\s{0,}/)[0]}\``);
    } else {
      await msg.reply(`Error in definition: ${defineErr}`);
    }
  }
  
  else if (message.startsWith(`${PREFIX} remove `)) {
    const removeVarName = message.split(`${PREFIX} remove `)[1];
    const [removeRes, removeErr] = userMathParser.remove(removeVarName);
    if (removeRes) {
      await msg.reply(`Successfully removed variable or function named ${removeVarName}`);
    } else {
      await msg.reply(`Error when removing \`${removeVarName}\`: ${removeErr}`);
    }
  }
  
  else if (message.startsWith(`${PREFIX} listvars`)) {
    const listOfVars = userMathParser.getDefines();
    if (listOfVars.length === 0) {
      await msg.reply(`You have no variables or functions defined.`);
    } else {
      await msg.reply(`Here are your variables and functions:\`\`\`${listOfVars.join("\n")}\`\`\``);
    }
  }

  else if (message.startsWith(`${PREFIX} help`)) {
    await msg.reply(helpString(PREFIX));
  }

  else {

    const [evaluateRes, evaluateNumber, evaluateErr] = userMathParser.evaluate(message);

    if (!evaluateRes) {
      await msg.reply(`Error in expression: ${evaluateErr}`);
      await userMathParser.saveProfile();
      return;
    }

    const savedNumberAndSender = await countingProgressData.popValue(msg.guildId);
    const [savedNumber, savedSender] = (savedNumberAndSender ?? "1,").split(",");

    const nextNumber = parseInt(savedNumber, 10);

    let savingStatus = true;

    if (savedSender === msg.author.id) {
      await msg.react("❌");
      await msg.reply(`Counting failed. You can't count twice in a row. Next number reset to 1`);
    }
    else if (evaluateNumber === nextNumber) {
      await msg.react("✅");
      savingStatus = await countingProgressData.insertValue(msg.guildId, `${nextNumber + 1},${msg.author.id}`);
    } 
    else {
      await msg.react("❌");
      await msg.reply(
        `Counting failed. (result is ${evaluateNumber} but next is ${nextNumber}) Next number reset to 1.`);
    }

    if (!savingStatus){
      msg.channel.send("Error saving progress");
    }
  }

  await userMathParser.saveProfile();
}

// Run on every message sent
client.on(Events.MessageCreate, async msg => {
  try {
    await onMessageHandler(msg)
  } catch (e) {
    msg.channel.send(e.message);
    console.warn(e);
  }
});

// Log in to Discord with your client's token
client.login(DISCORD_TOKEN);
