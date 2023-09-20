import { Proposal } from '@prophouse/sdk-react';

export interface ProposalFields {
  title: string;
  what: string;
}

const proposalFields = (proposal: Proposal): ProposalFields => ({
  title: proposal.title,
  what: proposal.body,
});

export default proposalFields;
