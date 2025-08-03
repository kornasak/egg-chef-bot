import { keepAlive } from "./keepAlive.js";
import { Client, GatewayIntentBits, Collection } from "discord.js";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import pkg from "./package.json" with { type: "json" };

dotenv.config();

keepAlive();

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.commands = new Collection();
const commandFiles = fs.readdirSync("./commands").filter(file => file.endsWith(".js"));
for (const file of commandFiles) {
  const command = await import(`./commands/${file}`);
  client.commands.set(command.default.data.name, command.default);
}

// ส่งเมนูอัตโนมัติตามเวลา
import schedule from "node-schedule";
import { getMenuText } from "./commands/menu.js";

// ใส่ ID ของช่องที่ต้องการให้ส่งเมนู
const CHANNEL_ID = process.env.CHANNEL_ID;

const sendMeal = async (mealTime) => {
  const channel = await client.channels.fetch(CHANNEL_ID);
  if (!channel) return;
  const menu = getMenuText(mealTime);
  channel.send(menu);
};

// ตั้งเวลา: 07:00, 12:00, 18:00
schedule.scheduleJob("0 7 * * *", () => sendMeal("เช้า"));
schedule.scheduleJob("0 12 * * *", () => sendMeal("กลางวัน"));
schedule.scheduleJob("0 18 * * *", () => sendMeal("เย็น"));

// สั่งงานคำสั่ง
client.on("interactionCreate", async interaction => {
  if (!interaction.isChatInputCommand()) return;
  const command = client.commands.get(interaction.commandName);
  if (!command) return;
  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    await interaction.reply({ content: "มีบางอย่างผิดพลาด!", ephemeral: true });
  }
});

client.once("ready", () => {
  console.log(`Logged in as ${client.user.tag}`);
});

client.login(process.env.TOKEN);
