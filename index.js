import { keepAlive } from "./keepAlive.js";
import { Client, GatewayIntentBits } from 'discord.js';
import "dotenv/config";
import pkg from "./package.json" with { type: "json" };

keepAlive();

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

const CHANNEL_ID = process.env.CHANNEL_ID;

const foodMenus = {
  morning: {
    normal: [
      { food: "ไข่กระทะ", drink: "นมถั่วเหลือง" },
      { food: "ข้าวต้มหมู", drink: "ชาอุ่นๆ" },
      { food: "แซนด์วิชทูน่า", drink: "น้ำผลไม้คั้นสด" },
    ],
    sick: [
      { food: "โจ๊กปลา", drink: "น้ำอุ่น" },
      { food: "ข้าวต้มไก่", drink: "เกลือแร่หรือน้ำขิง" },
    ]
  },
  lunch: {
    normal: [
      { food: "ข้าวผัดกุ้ง", drink: "ชาเย็น" },
      { food: "ข้าวกระเพราไก่", drink: "น้ำเปล่าเย็น" },
      { food: "ข้าวมันไก่", drink: "น้ำซุปอุ่นๆ" },
    ],
    sick: [
      { food: "ข้าวต้มหมูสับ", drink: "น้ำเกลือแร่" },
      { food: "ต้มจืดเต้าหู้หมูสับ", drink: "น้ำอุ่น" },
    ]
  },
  dinner: {
    normal: [
      { food: "ก๋วยจั๊บน้ำใส", drink: "น้ำบ๊วย" },
      { food: "ข้าวเหนียวหมูปิ้ง", drink: "ชาเขียว" },
      { food: "ต้มยำกุ้ง", drink: "น้ำเย็น" },
    ],
    sick: [
      { food: "ต้มจืดฟักไก่", drink: "น้ำขิงอุ่น" },
      { food: "ข้าวต้มปลา", drink: "น้ำเปล่า" },
    ]
  }
};

// ฟังก์ชันสุ่มเมนู
function getRandomMenu(type) {
  const item = menu[type][Math.floor(Math.random() * menu[type].length)];
  return `🍽️ ${item.meal} + 🥤 ${item.drink}`;
}

// ส่งข้อความรวม
async function sendMealSuggestion() {
  const channel = await client.channels.fetch(CHANNEL_ID);
  if (!channel) return;

  const message = `📅 **เมนูแนะนำวันนี้**

🌅 **มื้อเช้า:**  
${getRandomMenu('breakfast')}

🌞 **มื้อกลางวัน:**  
${getRandomMenu('lunch')}

🌙 **มื้อเย็น:**  
${getRandomMenu('dinner')}

🤒 **ถ้าไม่ค่อยสบาย:**  
${getRandomMenu('sick')}

ให้มื้อนี้อิ่มอร่อยและสุขภาพดีนะ~`;

  channel.send(message);
}

// ตรวจเวลาทุกนาที
setInterval(() => {
  const now = new Date();
  const hour = now.getHours();
  const minute = now.getMinutes();

  // ปรับตามเวลาเช้า 07:00, กลางวัน 12:00, เย็น 18:00
  if ((hour === 7 || hour === 12 || hour === 18) && minute === 0) {
    sendMealSuggestion();
  }
}, 60000);

client.once('ready', () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
});

client.login(process.env.TOKEN);
