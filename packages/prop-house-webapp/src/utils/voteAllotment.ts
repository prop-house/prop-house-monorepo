import { VoteAllotment } from '../types/VoteAllotment';

/**
 * Extracts VoteAllotment for a given proposal
 */
export const votesForProp = (voteAllotments: VoteAllotment[], proposalId: number) => {
  const a = voteAllotments.find(a => a.proposalId === proposalId);
  return a ? a.votes : 0;
};
