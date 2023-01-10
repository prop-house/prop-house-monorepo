import { StoredProposalWithVotes } from '@nouns/prop-house-wrapper/dist/builders';

/**
 * If a prop has been edited, the last updated date will be used to compare versus created date.
 * @param proposal Proposal
 * @returns a timedstamp
 */
export const getLastUpdatedDate = (proposal: StoredProposalWithVotes) =>
  proposal.lastUpdatedDate ? proposal.lastUpdatedDate : proposal.createdDate;
