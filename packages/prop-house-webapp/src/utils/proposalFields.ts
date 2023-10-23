import { Proposal } from '@prophouse/sdk-react';

export interface ProposalFields {
  title: string;
  what: string;
  tldr: string;
}

const proposalFields = (proposal: Proposal): ProposalFields => {
  // todo: load tldrs from proposal.metdataUri
  return {
    title: proposal.title,
    what: proposal.body,
    tldr: 'insert tldr here',
  };
};

export default proposalFields;
