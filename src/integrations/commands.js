import { bot } from "./bot.js";
import { newQTY } from "../services/metadataGet.js";

bot.onText(/\/minted/, (msg) => {
  const text = `${newQTY} PEPI's Minted`;
  const chatId = msg.chat.id;
  bot
    .sendMessage(chatId, text, {})
    .then((sent) => {
      console.log("total minted sent");
    })
    .catch((error) => {
      console.log("Error sending total minted");
    });
});
