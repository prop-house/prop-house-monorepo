import { Vote } from '@prophouse/sdk-react';

/**
 * Counts total number of validated `vote.weight` from `votes` for proposal
 */
export const countNumVotesForProp = (votes: Vote[], proposalId: number) =>
  votes
    .filter(v => v.proposalId === proposalId)
    .reduce((prev, current) => prev + Number(current.votingPower), 0);
