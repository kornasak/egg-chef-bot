import { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder } from "discord.js";
import dotenv from "dotenv";
import cron from "node-cron";
import { keepAlive } from "./keepAlive.js";
import { getMealMessage } from "./menu.js";
import pkg from "./package.json" assert { type: "json" };

dotenv.config();

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

const CHANNEL_ID = process.env.CHANNEL_ID;
const TOKEN = process.env.DISCORD_TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;

async function sendMeal(label) {
  try {
    const channel = await client.channels.fetch(CHANNEL_ID);
    if (channel && channel.isTextBased()) {
      await channel.send(getMealMessage(label));
      console.log(`✅ Sent ${label} meal message`);
    }
  } catch (error) {
    console.error(`❌ Error sending meal message for ${label}:`, error);
  }
}

client.once("ready", async () => {
  console.log(`🤖 Logged in as ${client.user.tag}`);

  // ตั้งเวลาส่งข้อความตามมื้อ
  cron.schedule("0 7 * * *", () => sendMeal("เช้า"));
  cron.schedule("0 12 * * *", () => sendMeal("กลางวัน"));
  cron.schedule("0 18 * * *", () => sendMeal("เย็น"));

  // ตั้ง status บอท
  const statuses = [
    "/suggest",
    "หิวเมื่อไหร่… หัวไข่จัดให้",
    "อยู่บ้านไม่รู้จะกินอะไร เรียกหัวไข่สิ!",
    "ทุกมื้อคือภารกิจ… ของหัวไข่"
  ];
  let statusIndex = 0;

  client.user.setPresence({
    activities: [{ name: `${statuses[statusIndex]} | V${pkg.version}`, type: 4 }],
    status: "online",
  });

  setInterval(() => {
    statusIndex = (statusIndex + 1) % statuses.length;
    client.user.setPresence({
      activities: [{ name: `${statuses[statusIndex]} | V${pkg.version}`, type: 4 }],
      status: "online",
    });
  }, 870000); // ทุก 14 นาที 30 วินาที
});

// ลงทะเบียนคำสั่ง /suggest
const rest = new REST({ version: "10" }).setToken(TOKEN);

async function registerCommands() {
  const suggestCommand = new SlashCommandBuilder()
    .setName("suggest")
    .setDescription("แนะนำเมนูอาหารสำหรับวันนี้แบบครบทุกมื้อ");

  try {
    console.log("⏳ กำลังลงทะเบียนคำสั่ง...");
    await rest.put(Routes.applicationCommands(CLIENT_ID), {
      body: [suggestCommand.toJSON()],
    });
    console.log("✅ ลงทะเบียนคำสั่งสำเร็จ");
  } catch (error) {
    console.error("❌ ลงทะเบียนคำสั่งล้มเหลว:", error);
  }
}

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;
  if (interaction.commandName === "suggest") {
    try {
      await interaction.deferReply();
      await interaction.editReply(getMealMessage());
    } catch (error) {
      console.error("❌ ตอบคำสั่งล้มเหลว:", error);
    }
  }
});

keepAlive();
registerCommands();
client.login(TOKEN);
