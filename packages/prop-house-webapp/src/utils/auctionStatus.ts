import { StoredTimedAuction } from '@nouns/prop-house-wrapper/dist/builders';
import dayjs from 'dayjs';

export enum AuctionStatus {
  AuctionNotStarted,
  AuctionAcceptingProps,
  AuctionVoting,
  AuctionEnded,
}

/**
 * Calculates auction state
 * @param auction Auction to check status of.
 */
export const auctionStatus = (auction: StoredTimedAuction): AuctionStatus => {
  const _now = dayjs();
  const _auctionStartTime = dayjs(auction.startTime);
  const _proposalEndTime = dayjs(auction.proposalEndTime);
  const _votingEndTime = dayjs(auction.votingEndTime);

  switch (true) {
    case _now.isBefore(_auctionStartTime):
      return AuctionStatus.AuctionNotStarted;
    case _now.isAfter(_auctionStartTime) && _now.isBefore(_proposalEndTime):
      return AuctionStatus.AuctionAcceptingProps;
    case _now.isAfter(_proposalEndTime) && _now.isBefore(_votingEndTime):
      return AuctionStatus.AuctionVoting;
    case _now.isAfter(_votingEndTime):
      return AuctionStatus.AuctionEnded;
    default:
      return AuctionStatus.AuctionEnded;
  }
};

/**
 * Returns copy for deadline corresponding to auction status
 */
export const deadlineCopy = (auction: StoredTimedAuction) => {
  const status = auctionStatus(auction);
  return status === AuctionStatus.AuctionNotStarted
    ? 'Round starts'
    : status === AuctionStatus.AuctionAcceptingProps
    ? 'Prop deadline'
    : status === AuctionStatus.AuctionVoting
    ? 'Voting ends'
    : status === AuctionStatus.AuctionEnded
    ? 'Round ended'
    : '';
};

/**
 * Returns deadline date for corresponding to auction status
 */
export const deadlineTime = (auction: StoredTimedAuction) =>
  auctionStatus(auction) === AuctionStatus.AuctionNotStarted
    ? auction.startTime
    : auctionStatus(auction) === AuctionStatus.AuctionAcceptingProps
    ? auction.proposalEndTime
    : auction.votingEndTime;
