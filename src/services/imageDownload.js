import path from "path";
import fetch from "node-fetch";
import fs from "fs";

// Ensure that the 'tmp' folder exists, or create it if it doesn't
const tempFolderPath = path.resolve("tmp");
if (!fs.existsSync(tempFolderPath)) {
  fs.mkdirSync(tempFolderPath, { recursive: true });
}

export async function downloadImage(url, outputPath) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("Failed to fetch the image");
    }

    const dest = fs.createWriteStream(outputPath);
    response.body.pipe(dest);

    return new Promise((resolve, reject) => {
      dest.on("finish", () => {
        console.log(`Image saved to ${outputPath}`);
        resolve(); // resolve the promise when the download is finished
      });
      dest.on("error", (err) => {
        console.error("Error saving the image to tmp folder:");
        reject(err); // reject the promise if an error occurs
      });
    });
  } catch (error) {
    console.log("Error downloading the image:");
  }
}

export function outputPaths(newNftNumber) {
  const outputPath = path.resolve(tempFolderPath, `${newNftNumber}.png`); // Output path within 'a tmp' folder
  return outputPath;
}
