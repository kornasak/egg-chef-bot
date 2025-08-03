import { SlashCommandBuilder } from "discord.js";

const breakfast = [
  ["ข้าวต้มปลา", "น้ำเต้าหู้"],
  ["โจ๊กหมู", "ชาเขียวเย็น"],
  ["ขนมปังไข่ดาว", "กาแฟร้อน"],
];

const lunch = [
  ["ข้าวกระเพราไก่", "น้ำเปล่า"],
  ["ผัดซีอิ๊วหมู", "น้ำมะนาว"],
  ["ข้าวแกงเขียวหวาน", "ชามะนาว"],
];

const dinner = [
  ["ข้าวต้มหมู", "น้ำเก๊กฮวย"],
  ["แกงจืดเต้าหู้หมูสับ", "น้ำลำไย"],
  ["ข้าวไข่เจียว", "นมถั่วเหลือง"],
];

const sickMenu = [
  ["โจ๊กไก่", "น้ำขิง"],
  ["ซุปฟักทอง", "น้ำอุ่น"],
];

function getRandomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function getMenuText(mealTime) {
  const mealMap = {
    "เช้า": breakfast,
    "กลางวัน": lunch,
    "เย็น": dinner,
  };
  const [meal, drink] = getRandomItem(mealMap[mealTime] || breakfast);
  const [sickMeal, sickDrink] = getRandomItem(sickMenu);

  return `📅 เมนูแนะนำวันนี้

🌅 มื้อ${mealTime}: ${meal} + ${drink}
🤒 ถ้าไม่ค่อยสบาย: ${sickMeal} + ${sickDrink}
`;
}

export default {
  data: new SlashCommandBuilder()
    .setName("suggest")
    .setDescription("แนะนำเมนูมื้ออาหารแบบสุ่ม")
    .addStringOption(option =>
      option.setName("มื้อ")
        .setDescription("เลือกมื้ออาหาร")
        .setRequired(true)
        .addChoices(
          { name: "เช้า", value: "เช้า" },
          { name: "กลางวัน", value: "กลางวัน" },
          { name: "เย็น", value: "เย็น" }
        )
    ),

  async execute(interaction) {
    const mealTime = interaction.options.getString("มื้อ");
    const text = getMenuText(mealTime);
    await interaction.reply(text);
  }
};
