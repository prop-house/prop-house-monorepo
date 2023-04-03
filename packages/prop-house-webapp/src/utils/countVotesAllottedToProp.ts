import { VoteAllotment } from '../types/VoteAllotment';

/**
 * Adds up vote weight from vote allotments towards a proposal
 */
export const countVotesAllottedToProp = (voteAllotments: VoteAllotment[], proposalId: number) => {
  const a = voteAllotments.find(a => a.proposalId === proposalId);
  return a ? a.votes : 0;
};
