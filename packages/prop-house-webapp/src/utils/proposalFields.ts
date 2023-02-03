import { StoredProposal } from '@nouns/prop-house-wrapper/dist/builders';

export interface ProposalFields {
  title: string;
  what: string;
  tldr: string;
  reqAmount: number | null;
}

const proposalFields = (proposal: StoredProposal): ProposalFields => ({
  title: proposal.title,
  what: proposal.what,
  tldr: proposal.tldr,
  reqAmount: proposal.reqAmount,
});

export default proposalFields;
