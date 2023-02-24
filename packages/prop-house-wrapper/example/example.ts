import { Signer } from '@ethersproject/abstract-signer';
import { HDNode } from '@ethersproject/hdnode';
import { Wallet } from '@ethersproject/wallet';
import { PropHouseWrapper } from '../src';
import {
  DeleteProposal,
  Direction,
  Proposal,
  UpdatedProposal,
  Vote,
} from '../src/builders';

const run = async () => {
  const exampleWallet = Wallet.fromMnemonic(
    'test test test test test test test test test test test junk',
  );
  const adminPath = "m/44'/60'/0'/0/1";
  const adminWallet = Wallet.fromMnemonic(
    'test test test test test test test test test test test junk',
    adminPath,
  );
  console.log(`The example wallet is using address ${exampleWallet.address}`);
  console.log(`The admin wallet is using address ${adminWallet.address}`);

  const local = new PropHouseWrapper('http://localhost:3000', exampleWallet);

  const auction = (await local.getAuctions())[0];

  const proposal = new Proposal(
    'My first proposal',
    'This is the body portion of my proposal',
    "Oh look at me I'm a proposal",
    auction.id,
  );

  const newProposal = await local.createProposal(proposal);

  const updatedProposal = new UpdatedProposal(
    newProposal.id,
    'This title has been updated',
    newProposal.what,
    newProposal.tldr,
    newProposal.auction.id,
  );
  await local.updateProposal(updatedProposal);

  await local.deleteProposal(new DeleteProposal(updatedProposal.id));
  console.log(`Deleted proposal with ID ${updatedProposal.id}`);
};

run();
