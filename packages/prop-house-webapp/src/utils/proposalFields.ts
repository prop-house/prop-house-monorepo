import { Proposal } from '@prophouse/sdk-react';

export interface ProposalFields {
  title: string;
  what: string;
  tldr: string;
  reqAmount: number | null;
}

const proposalFields = (proposal: Proposal): ProposalFields => ({
  title: proposal.title,
  what: proposal.body,
  tldr: '', // proposal.tldr, Doesn't currently exist. Could parse this server-side though.
  reqAmount: null, // proposal.reqAmount, TODO: Not a thing
});

export default proposalFields;
