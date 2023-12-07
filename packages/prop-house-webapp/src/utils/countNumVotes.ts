import { Vote } from '@prophouse/sdk-react';

/**
 * Counts total number of validated `vote.weight` from `votes`
 */
export const countNumVotes = (votes: Vote[]) =>
  votes.reduce((prev, current) => prev + Number(current.votingPower), 0);
