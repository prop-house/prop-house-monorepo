import { Direction } from '@nouns/prop-house-wrapper/dist/builders';
import { VoteAllotment } from '../types/VoteAllotment';

/**
 * Adds up vote weight from vote allotments towards a proposal
 */
export const countVotesAllottedToProp = (voteAllotments: VoteAllotment[], proposalId: number) => {
  const a = voteAllotments.find(a => a.proposalId === proposalId);
  return a ? a.votes : 0;
};

export const countVotesAllottedToPropWithDirection = (
  voteAllotments: VoteAllotment[],
  proposalId: number,
  direction: Direction,
) => {
  const a = voteAllotments.find(a => a.proposalId === proposalId && a.direction === direction);
  return a ? a.votes : 0;
};
