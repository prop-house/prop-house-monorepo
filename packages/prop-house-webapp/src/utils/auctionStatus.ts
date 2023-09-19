import { StoredAuctionBase, StoredTimedAuction } from '@nouns/prop-house-wrapper/dist/builders';
import dayjs from 'dayjs';
import { isInfAuction } from './auctionType';
import { Round } from '@prophouse/sdk-react';

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
export const auctionStatus = (auction: StoredAuctionBase): AuctionStatus => {
  const _now = dayjs();
  const _auctionStartTime = dayjs(auction.startTime);

  if (_now.isBefore(_auctionStartTime)) return AuctionStatus.AuctionNotStarted;
  if (isInfAuction(auction)) return AuctionStatus.AuctionAcceptingProps;

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
 * Calculates auction state
 * @param auction Auction to check status of.
 */
export const _auctionStatus = (round: Round): AuctionStatus => {
  const _now = dayjs();
  const _roundStartTime = dayjs(round.config.proposalPeriodStartTimestamp);

  if (_now.isBefore(_roundStartTime)) return AuctionStatus.AuctionNotStarted;

  const _proposalEndTime = dayjs(round.config.proposalPeriodEndTimestamp);
  const _votingEndTime = dayjs(round.config.votePeriodEndTimestamp);

  switch (true) {
    case _now.isBefore(_roundStartTime):
      return AuctionStatus.AuctionNotStarted;
    case _now.isAfter(_roundStartTime) && _now.isBefore(_proposalEndTime):
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
export const deadlineCopy = (auction: StoredAuctionBase) => {
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
