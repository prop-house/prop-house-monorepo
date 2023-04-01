import {
  StoredProposalWithVotes,
  StoredAuctionBase,
} from '@nouns/prop-house-wrapper/dist/builders';
import { AuctionStatus, auctionStatus } from './auctionStatus';
import { isInfAuction } from './auctionType';
import { sortByVotesAndHandleTies } from './sortByVotesAndHandleTies';

const getWinningIds = (proposals: StoredProposalWithVotes[], auction: StoredAuctionBase) => {
  if (isInfAuction(auction))
    return proposals.filter(p => p.voteCount >= auction.quorum).map(p => p.id);

  // empty array to store winning ids
  const winningIds: number[] = [];

  // return empty array if auction is accepting proposals or has not started
  if (
    auctionStatus(auction) === AuctionStatus.AuctionAcceptingProps ||
    auctionStatus(auction) === AuctionStatus.AuctionNotStarted
  )
    return winningIds;

  // sort the proposals by votes and handle ties
  const sortedProposals = proposals && sortByVotesAndHandleTies(proposals.slice(), false);

  // push the winning ids to the array
  sortedProposals &&
    sortedProposals.slice(0, auction.numWinners).map(p =>
      auctionStatus(auction) === AuctionStatus.AuctionVoting
        ? // skip proposals with 0 votes if auction is in voting phase
          p.voteCount !== 0 && winningIds.push(p.id)
        : winningIds.push(p.id),
    );

  return winningIds;
};

export default getWinningIds;
