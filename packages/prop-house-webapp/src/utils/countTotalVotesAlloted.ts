import { VoteAllotment } from '../types/VoteAllotment';

/**
 * Total vote weight for all vote allotments
 */
export const countTotalVotesAlloted = (voteAllotments: VoteAllotment[]) =>
  voteAllotments.reduce((counter, allotment) => Number(counter) + Number(allotment.votes), 0);
