import { Proposal } from '@prophouse/sdk-react';
import { ProposalWithTldr } from '../types/ProposalWithTldr';
import { generateIpfsUri } from './resolveUri';

// Fetches the tldr from the metadataURI of each proposal
export const resolveProposalTldrs = async (proposals: Proposal[]) => {
  try {
    const ipfsHashes = proposals.map(p => p.metadataURI.split('ipfs://')[1]);
    const ipfsUris = ipfsHashes.map(hash => generateIpfsUri(hash));
    const resolvedUris = await Promise.all(ipfsUris.map(uri => fetch(uri)));
    const result = await Promise.all(resolvedUris.map(res => res.json()));
    const proposalsWithTldrs: ProposalWithTldr[] = proposals.map((p, i) => {
      return { ...p, tldr: result[i].tldr };
    });
    return proposalsWithTldrs;
  } catch (e) {
    console.log(e);
  }
};
