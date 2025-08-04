import { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder } from "discord.js";
import dotenv from "dotenv";
import { keepAlive } from "./keepAlive.js";
import { breakfast, lunch, dinner, drinks, sickMenus } from "./menu.js";
import pkg from "./package.json" with { type: "json" };

dotenv.config();

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

const getRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];

function getMealMessage() {
  return `
🍽️ **มื้อเช้า:** ${getRandom(breakfast)} + เครื่องดื่ม: ${getRandom(drinks)}
🌞 **มื้อกลางวัน:** ${getRandom(lunch)} + เครื่องดื่ม: ${getRandom(drinks)}
🌙 **มื้อเย็น:** ${getRandom(dinner)} + เครื่องดื่ม: ${getRandom(drinks)}
🤒 ถ้าไม่ค่อยสบาย แนะนำ: ${getRandom(sickMenus)}
  `;
}

// ส่งอัตโนมัติตามเวลา (7:00, 12:00, 18:00)
const schedule = [
  { hour: 7, label: "เช้า" },
  { hour: 12, label: "กลางวัน" },
  { hour: 18, label: "เย็น" }
];

client.once("ready", () => {
  console.log(`🤖 Logged in as ${client.user.tag}`);
  setInterval(() => {
    const now = new Date();
    for (const { hour } of schedule) {
      if (now.getHours() === hour && now.getMinutes() === 0) {
        const channel = client.channels.cache.get(process.env.CHANNEL_ID);
        if (channel) {
          channel.send(getMealMessage());
        }
      }
    }
  }, 60 * 1000); // check every minute

  const statuses = ["/suggest", "หิวเมื่อไหร่… หัวไข่จัดให้", "อยู่บ้านไม่รู้จะกินอะไร เรียกหัวไข่สิ!", "ทุกมื้อคือภารกิจ… ของหัวไข่"];
  let statusIndex = 0;

  // แสดง status ทันทีรอบแรก
  client.user.setPresence({
    activities: [{ name: `${statuses[statusIndex]} | V${pkg.version}`, type: 4 }],
    status: "online",
  });

  statusIndex = (statusIndex + 1) % statuses.length;

  // 👉 อัปเดต status ทุก 14 นาที 30 วินาที
  setInterval(() => {
    const status = statuses[statusIndex];
    client.user.setPresence({
      activities: [{ name: `${status} | V${pkg.version}`, type: 4 }],
      status: "online",
    });
    statusIndex = (statusIndex + 1) % statuses.length;
  }, 870000);
});

// คำสั่ง /เมนูตอนนี้
const mealCommand = new SlashCommandBuilder()
  .setName("suggest")
  .setDescription("แนะนำเมนูอาหารสำหรับวันนี้แบบครบทุกมื้อ");

const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN);
await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), {
  body: [mealCommand.toJSON()],
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;
  if (interaction.commandName === "suggest") {
    await interaction.reply(getMealMessage());
  }
});

keepAlive();
client.login(process.env.DISCORD_TOKEN);
