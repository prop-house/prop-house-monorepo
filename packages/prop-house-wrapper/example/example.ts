import { Signer } from "@ethersproject/abstract-signer";
import { HDNode } from "@ethersproject/hdnode";
import { Wallet } from "@ethersproject/wallet";
import { PropHouseWrapper } from "../src";
import { Auction, Direction, Proposal, Vote } from "../src/builders";

const run = async () => {
  const exampleWallet = Wallet.fromMnemonic(
    "test test test test test test test test test test test junk"
  );
  const adminPath = "m/44'/60'/0'/0/1";
  const adminWallet = Wallet.fromMnemonic(
    "test test test test test test test test test test test junk",
    adminPath
  );
  console.log(`The example wallet is using address ${exampleWallet.address}`);
  console.log(`The admin wallet is using address ${adminWallet.address}`);

  const local = new PropHouseWrapper("http://localhost:3000", exampleWallet);

  const auction = new Auction(
    true,
    "First Auction",
    new Date("2021-12-01"),
    new Date("2021-12-3"),
    new Date("2021-12-8"),
    5
  );


  const newAuction = await local.createAuction(auction);
  const proposal = new Proposal(
    "My first proposal",
    "Oh look at me I'm a proposal",
    newAuction.id
  );

    const newProposal = await local.createProposal(proposal);
  try {
		const newVote = await local.logVote(new Vote(Direction.Up, newProposal.id))
  } catch (e: any) {
    console.log(e.response.data);
  }
};

run();
