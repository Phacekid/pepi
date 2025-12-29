import TelegramBot from "node-telegram-bot-api";
import dotenv from "dotenv";

dotenv.config();

const token = process.env.TOKEN;
export const chatID = process.env.CHAT_ID;
export const bot = new TelegramBot(token, { polling: true });

console.log("bot instance initialized");
