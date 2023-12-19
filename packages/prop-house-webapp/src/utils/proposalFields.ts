import { Proposal } from '@prophouse/sdk-react';

export interface ProposalFields {
  title: string;
  what: string;
  tldr: string;
}

const proposalFields = (proposal: Proposal): ProposalFields => {
  return {
    title: proposal.title,
    what: proposal.body,
    tldr: proposal.tldr,
  };
};

export default proposalFields;
