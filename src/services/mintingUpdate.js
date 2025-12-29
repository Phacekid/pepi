import { queryMintingNFTs, getMinted } from "./queryChainGraph.js";
import { tokenId, chaingraphUrl } from "../config/config.js";
let offset = 0;
let nftsMinted = 0;
export async function updateMinting() {
  const responseJson = await queryMintingNFTs(offset, tokenId, chaingraphUrl);

  if (responseJson.data) {
    const length = responseJson.data.output.length || 0;

    if (length === 5000) {
      offset += 5000;
      updateMinting();
    }

    nftsMinted = length + offset;
    // console.log("nfts minted:", nftsMinted);
    return nftsMinted;
  }
}

export async function getMintedQty(nftsMinted) {
  const mintedResponseJson = await getMinted(
    nftsMinted,
    tokenId,
    chaingraphUrl
  );

  if (mintedResponseJson.data) {
    const mintedQuantity = mintedResponseJson.data.output;

    nftsMinted = mintedQuantity;
    // console.log("nfts minted:", nftsMinted)
    return nftsMinted;
  }
}
