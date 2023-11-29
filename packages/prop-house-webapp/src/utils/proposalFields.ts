import { ProposalWithTldr } from '../types/ProposalWithTldr';

export interface ProposalFields {
  title: string;
  what: string;
  tldr: string;
}

const proposalFields = (proposal: ProposalWithTldr): ProposalFields => {
  return {
    title: proposal.title,
    what: proposal.body,
    tldr: proposal.tldr,
  };
};

export default proposalFields;
