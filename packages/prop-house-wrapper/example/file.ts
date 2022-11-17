import { Signer } from "@ethersproject/abstract-signer";
import { HDNode } from "@ethersproject/hdnode";
import { Wallet } from "@ethersproject/wallet";
import { PropHouseWrapper } from "../src";
import { Auction, Direction, Proposal, Vote } from "../src/builders";

const run = async () => {
  const exampleWallet = Wallet.fromMnemonic(
    "test test test test test test test test test test test junk"
  );

  const local = new PropHouseWrapper("http://localhost:3000", exampleWallet);

  // Post with signature
  const response = await local.postFileFromDisk("./110.png", "110.png")
  console.log(response?.data)

  // Post without signature
  const unsignedResponse = await local.postFileFromDisk("./110.png", "110.png", false)
  console.log(response?.data)

  const signerless = new PropHouseWrapper("http://localhost:3000");

  const signerlessResponse = await signerless.postFileFromDisk("./211.png", "211.png")
  console.log(signerlessResponse?.data)
};

run();
