import { StoredAuctionBase } from '@nouns/prop-house-wrapper/dist/builders';
import dayjs from 'dayjs';
import { isInfAuction } from './auctionType';
import { Round, Timed } from '@prophouse/sdk-react';

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
  const _roundStartTime = dayjs(round.config.proposalPeriodStartTimestamp * 1000);

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
export const deadlineCopy = (round: Round) => {
  const state = round.state;
  return state < Timed.RoundState.IN_PROPOSING_PERIOD
    ? 'Round starts'
    : state === Timed.RoundState.IN_PROPOSING_PERIOD
    ? 'Prop deadline'
    : state === Timed.RoundState.IN_VOTING_PERIOD
    ? 'Voting ends'
    : state > Timed.RoundState.IN_VOTING_PERIOD
    ? 'Round ended'
    : '';
};

/**
 * Returns deadline date for corresponding to auction status
 */
export const deadlineTime = (round: Round) =>
  round.state < Timed.RoundState.IN_PROPOSING_PERIOD
    ? new Date(round.config.proposalPeriodStartTimestamp * 1000)
    : round.state === Timed.RoundState.IN_PROPOSING_PERIOD
    ? new Date(round.config.proposalPeriodEndTimestamp * 1000)
    : new Date(round.config.votePeriodEndTimestamp * 1000);
