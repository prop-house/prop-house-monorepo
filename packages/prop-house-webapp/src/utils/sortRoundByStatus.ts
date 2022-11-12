import { StoredAuction } from '@nouns/prop-house-wrapper/dist/builders';
import { auctionStatus } from './auctionStatus';

/**
 * Sort rounds, or groups of rounds, by their status.
 * Custom order: Proposing, Voting, Not Started, Ended
 */
export const sortRoundByStatus = (rounds: StoredAuction[]) => [
  ...rounds.filter(round => auctionStatus(round) === 1),
  ...rounds.filter(round => auctionStatus(round) === 2),
  ...rounds.filter(round => auctionStatus(round) === 0),

  ...rounds
    .filter(round => auctionStatus(round) === 3)
    .sort((a, b) => (a.startTime > b.startTime ? -1 : 1)),
];
