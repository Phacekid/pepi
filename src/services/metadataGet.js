import { vmNumberToBigInt, hexToBin } from "@bitauth/libauth";
import { updateMinting, getMintedQty } from "./mintingUpdate.js";
import { sendMssgToTG } from "../integrations/sendImage.js";
import fetch from "node-fetch";
import { bcmrLink } from "../config/config.js";

let formerQTY = 0;
let newQTY = 0;
let nftName = "";
let finalMetadata = "";
let txHash = "";
let imageUrl = "";
let newNftNumber = "";
let formattedOutput = "";

export async function getMetadata() {
  try {
    console.log("Getting Total Minted!");
    newQTY = await updateMinting();
    if (formerQTY === 0) {
      formerQTY = newQTY;
      console.log("formerQTY:", newQTY);
    } else if (formerQTY !== newQTY) {
      console.log("new transaction detected!!");
      // const mintedList = await getMintedQty(600);
      const mintedList = await getMintedQty(formerQTY);
      const recentMints = mintedList.reverse();
      const listPromises = [];

      for (const tx of recentMints) {
        try {
          const txInfoPromise = {
            hash: tx["transaction"]["hash"],
            commitment: tx["nonfungible_token_commitment"],
          };
          listPromises.push(txInfoPromise);
        } catch (err) {
          console.log("txInfoPromise error");
        }
      }
      const txInfoList = await Promise.all(listPromises);
      const nftList = [];

      for (const txInfo of txInfoList) {
        try {
          const nftCommitment = txInfo["commitment"].replace(/^\\x/, "");
          nftList.push({
            commitment: nftCommitment,
            nftNumber: Number(vmNumberToBigInt(hexToBin(nftCommitment)) + 1n),
            hash: txInfo["hash"].replace(/^\\x/, ""),
          });
        } catch (err) {
          console.log("nftCommitment error");
        }
      }
      nftList.reverse();

      for (const eachNft in nftList) {
        try {
          txHash = nftList[eachNft]["hash"];
          let BCMRlink = `${bcmrLink}/${nftList[eachNft]["commitment"]}/`;
          const BCMRResponse = await fetch(BCMRlink);
          const data = await BCMRResponse.json();
          // console.log(data);
          nftName = data["type_metadata"]["name"];
          const nftAttr = data["type_metadata"]["extensions"]["attributes"];
          newNftNumber = nftList[eachNft]["nftNumber"];
          console.log(nftList[eachNft]["nftNumber"], "PEPI minted");

          let out = new Array();
          imageUrl = data["type_metadata"]["uris"]["image"].replace(
            "ipfs://",
            "https://ipfs.io/ipfs/"
          );
          for (let key in nftAttr) {
            if (nftAttr.hasOwnProperty(key)) {
              if (nftAttr[key] === "None" || nftAttr[key] === undefined) {
                delete nftAttr[key];
              } else {
                out.push(`- ${key}: ${nftAttr[key]} `);
              }
            }
          }

          finalMetadata = `\<code\>${out.join("\n")}\<\/code\>`;
          formattedOutput = `${nftName} has been Minted
\<b\>\<code\>Attributes:\<\/code\>\<\/b\>
${finalMetadata}
          
<a href="https://explorer.salemkode.com/tx/${txHash}">Transaction ID</a>
`;
        } catch (err) {
          console.log(`BCMR ERR`);
        }
        await sendMssgToTG(formattedOutput, imageUrl, newNftNumber).then(() => {
          formerQTY = newQTY;
        });
      }
    }
  } catch (err) {
    console.log(`Metadata ERROR`);
  }
}

export { formerQTY, newQTY };
