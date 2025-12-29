process.env.NTBA_FIX_350 = 1;
import express from "express";
import cors from "cors";
import { mintAddress, PORT, projectName } from "./src/config/config.js";
import { getMetadata, newQTY } from "./src/services/metadataGet.js";
import "./src/integrations/commands.js";
import { ElectrumClient } from "@electrum-cash/network";

const electrum = new ElectrumClient(projectName, "1.4.1", "bch.imaginary.cash");

const port = PORT || 4000;
const app = express();
app.use(cors());
app.use(express.json());

async function handleNotifications() {
  await getMetadata();
}

app.get("/", (req, res) => {
  res.json({
    nftsMinted: newQTY,
  });
});

async function startElectrum() {
  try {
    console.log("Connecting to Electrum...");
    await electrum.connect();

    // Set up listeners
    electrum.on("notification", () => handleNotifications());

    // Subscribe to address
    await electrum.subscribe(`blockchain.address.subscribe`, mintAddress);
    console.log(`Electrum connected and subscribed to: ${mintAddress}`);
  } catch (error) {
    console.error("Electrum connection failed:", error);
  }
}

app.listen(port, () => {
  console.log(`Express server running at http://localhost:${port}`);
  startElectrum();
});
