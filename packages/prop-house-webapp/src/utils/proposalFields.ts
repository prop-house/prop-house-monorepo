import { StoredProposal } from '@nouns/prop-house-wrapper/dist/builders';

export interface ProposalFields {
  title: string;
  what: string;
  tldr: string;
}

const proposalFields = (proposal: StoredProposal): ProposalFields => ({
  title: proposal.title,
  what: proposal.what,
  tldr: proposal.tldr,
});

export default proposalFields;
