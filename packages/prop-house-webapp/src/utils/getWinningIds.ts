import { StoredAuction, StoredProposalWithVotes } from '@nouns/prop-house-wrapper/dist/builders';
import { AuctionStatus, auctionStatus } from './auctionStatus';

const getWinningIds = (
  proposals: StoredProposalWithVotes[] | undefined,
  auction: StoredAuction,
) => {
  // empty array to story
  if (auctionStatus(auction) !== AuctionStatus.AuctionEnded) return;

  const winningIds: number[] = [];

  proposals &&
    proposals
      .slice()
      .sort((a, b) => (Number(a.score) < Number(b.score) ? 1 : -1))
      .slice(0, auction.numWinners)
      .map(p => winningIds.push(p.id));

  return winningIds;
};

export default getWinningIds;
