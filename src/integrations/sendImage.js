import { setTimeout } from "node:timers/promises";

import { downloadImage, outputPaths } from "../services/imageDownload.js";
import { bot, chatID } from "./bot.js";

async function sendSafeMessage(newNftNumber, formattedOutput, attempt = 1) {
  try {
    return await bot.sendPhoto(
      chatID,
      outputPaths(newNftNumber),
      {
        caption: formattedOutput,
        parse_mode: "HTML",
      },
      {
        filename: `${newNftNumber}.png`,
        contentType: "image/png",
      }
    );
  } catch (error) {
    if (error.response && error.response.statusCode === 429) {
      const retryAfter = error.response.body.parameters.retry_after;
      console.warn(
        `[429] Rate Limited. Waiting ${retryAfter}s before retry (Attempt ${attempt})...`
      );

      // Wait for the requested time + 500ms buffer to be safe
      await setTimeout(retryAfter * 1000 + 500);

      // Recursive call to try again
      return sendSafeMessage(newNftNumber, formattedOutput, attempt + 1);
    }
    throw error;
  }
}

export async function sendMssgToTG(formattedOutput, imageUrl, newNftNumber) {
  try {
    await downloadImage(imageUrl, outputPaths(newNftNumber));
    await sendSafeMessage(newNftNumber, formattedOutput)
      .then(() => console.log("Message delivered to TG"))
      .catch((err) => console.error("Final Failure:", err.message));
  } catch (err) {
    console.log("TG send Err:");
  }
}
