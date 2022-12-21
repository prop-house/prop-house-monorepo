import { StoredAuction, StoredProposalWithVotes } from '@nouns/prop-house-wrapper/dist/builders';
import dayjs from 'dayjs';
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

  const sortedProposals =
    proposals &&
    proposals.slice().sort((a, b) => {
      if (Number(a.voteCount) > Number(b.voteCount)) {
        return -1;
      } else if (Number(a.voteCount) < Number(b.voteCount)) {
        return 1;
      } else {
        // If the vote counts are equal, sort by created date from oldest to newest
        return (dayjs(a.createdDate) as any) - (dayjs(b.createdDate) as any);
      }
    });
  sortedProposals && sortedProposals.slice(0, auction.numWinners).map(p => winningIds.push(p.id));

  return winningIds;
};

export default getWinningIds;
