import { StoredAuction, StoredProposalWithVotes } from '@nouns/prop-house-wrapper/dist/builders';
import { AuctionStatus, auctionStatus } from './auctionStatus';
import { sortByVotesAndHandleTies } from './sortByVotesAndHandleTies';

const getWinningIds = (
  proposals: StoredProposalWithVotes[] | undefined,
  auction: StoredAuction,
) => {
  if (
    auctionStatus(auction) === AuctionStatus.AuctionAcceptingProps ||
    auctionStatus(auction) === AuctionStatus.AuctionNotStarted
  )
    return;

  // empty array to store winning ids
  const winningIds: number[] = [];

  // sort the proposals by votes and handle ties
  const sortedProposals = proposals && sortByVotesAndHandleTies(proposals.slice(), false);

  // push the winning ids to the array
  sortedProposals && sortedProposals.slice(0, auction.numWinners).map(p => winningIds.push(p.id));

  return winningIds;
};

export default getWinningIds;
