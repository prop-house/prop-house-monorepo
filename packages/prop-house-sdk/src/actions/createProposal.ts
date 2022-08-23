import snapshot from '@snapshot-labs/snapshot.js';
import { Web3Provider } from '@ethersproject/providers';
import { snapshotHub } from '../constants/snapshotHub';
import { Proposal } from '@snapshot-labs/snapshot.js/dist/sign/types';
import { ProposalUserInput, ProposalSpaceInput } from '../types/Proposal';

export const createProposal = async (provider: Web3Provider, propUserInput: ProposalUserInput) => {
  const propSpaceInput: ProposalSpaceInput = {
    type: 'single-choice',
    discussion: '', // link to related discussion (e.g. discourse)
    choices: ['FOR'], // the choice(s) to select, should be just one (essentialy, voting FOR)
    start: 1661215536, // voting period start
    end: 1661388336, // voting period end
    snapshot: 15392445, // snapshot block (should be === across all proposals within space)
    plugins: JSON.stringify({}),
  };

  const proposal: Proposal = {
    ...propUserInput,
    ...propSpaceInput,
  };

  const hub = snapshotHub;
  const client = new snapshot.Client712(hub);

  try {
    const [account] = await provider.listAccounts();
    const receipt = await client.proposal(provider, account, proposal);
    return receipt;
  } catch (e) {
    throw Error(`Error creating proposal: ${e}`);
  }
};
