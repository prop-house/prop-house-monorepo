import { StoredAuction, StoredProposalWithVotes } from '@nouns/prop-house-wrapper/dist/builders';
import { AuctionStatus, auctionStatus } from './auctionStatus';

const getWinningIds = (
  proposals: StoredProposalWithVotes[] | undefined,
  auction: StoredAuction,
) => {
  if (
    auctionStatus(auction) === AuctionStatus.AuctionAcceptingProps ||
    auctionStatus(auction) === AuctionStatus.AuctionNotStarted
  )
    return;

  // empty array to store
  const winningIds: number[] = [];

  proposals &&
    proposals
      .slice()
      .sort((a, b) => (Number(a.voteCount) < Number(b.voteCount) ? 1 : -1))
      .slice(0, auction.numWinners)
      .map(p => winningIds.push(p.id));

  return winningIds;
};

export default getWinningIds;
