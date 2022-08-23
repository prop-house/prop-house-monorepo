import snapshot from '@snapshot-labs/snapshot.js';
import { Web3Provider } from '@ethersproject/providers';
import { snapshotHub } from '../constants/snapshotHub';
import { Proposal } from '@snapshot-labs/snapshot.js/dist/sign/types';

export const createProposal = async (
  provider: Web3Provider,
  proposal: Proposal
) => {
  // two parts to proposals:
  // user data
  // space data

  // fetch space info to fill in properties for proposal
  ///////////////////////////////////////////////////
  // start: 1, // voting period start
  // end: 1, // voting period end
  // snapshot: 1, // snapshot block (should be === across all proposals within space)
  // plugins: '', // proposal period start & end  https://github.com/snapshot-labs/snapshot.js/blob/master/src/validations/timeperiod/examples.json

  const hub = snapshotHub; // or https://testnet.snapshot.org for testnet
  const client = new snapshot.Client712(hub);

  try {
    const [account] = await provider.listAccounts();
    const receipt = await client.proposal(provider, account, proposal);
    console.log('receipt from creation of prop: ', receipt);
    return receipt;
  } catch (e) {
    console.log(e);
    throw Error(`Error creating proposal: ${e}`);
  }
};
