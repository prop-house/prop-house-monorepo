import { Vote } from '@prophouse/sdk-react';
import { parsedVotingPower } from './parsedVotingPower';

/**
 * Counts total number of validated `vote.weight` from `votes`
 */
export const countNumVotes = (votes: Vote[], roundAddress: string) =>
  votes.reduce(
    (prev, current) => prev + Number(parsedVotingPower(current.votingPower, roundAddress)),
    0,
  );
