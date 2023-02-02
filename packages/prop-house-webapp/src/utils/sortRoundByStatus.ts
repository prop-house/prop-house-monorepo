import { StoredAuctionBase } from '@nouns/prop-house-wrapper/dist/builders';
import { AuctionStatus, auctionStatus } from './auctionStatus';
import { isInfAuction } from './auctionType';

/**
 * Sort rounds, or groups of rounds, by their status.
 * Custom order: Proposing, Voting, Not Started, Ended
 */
export const sortRoundByStatus = (rounds: StoredAuctionBase[]) => [
  ...rounds.filter(
    round => auctionStatus(round) === AuctionStatus.AuctionAcceptingProps && isInfAuction(round),
  ),
  ...rounds.filter(round => auctionStatus(round) === AuctionStatus.AuctionAcceptingProps),
  ...rounds.filter(round => auctionStatus(round) === AuctionStatus.AuctionVoting),
  ...rounds.filter(round => auctionStatus(round) === AuctionStatus.AuctionNotStarted),
  ...rounds
    .filter(round => auctionStatus(round) === AuctionStatus.AuctionEnded)
    .sort((a, b) => (a.startTime > b.startTime ? -1 : 1)),
];
