import { Vote } from '@prophouse/sdk-react';

export const countNumVotesForPropWithDirection = (votes: Vote[], proposalId: number) =>
  votes
    .filter(v => v.proposalId === proposalId)
    .reduce((prev, current) => prev + Number(current.votingPower), 0);
