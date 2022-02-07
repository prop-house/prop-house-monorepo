import { StoredAuction } from '@nouns/prop-house-wrapper/dist/builders';
import dayjs from 'dayjs';
import { StatusPillState } from '../components/StatusPill';

/**
 * Calculates auction state
 * @param auction Auction to check status of.
 */
const auctionStatus = (auction: StoredAuction): StatusPillState => {
  const _now = dayjs();
  const _auctionStartTime = dayjs(auction.startTime);
  const _proposalEndTime = dayjs(auction.proposalEndTime);
  const _votingEndTime = dayjs(auction.votingEndTime);

  switch (true) {
    case _now.isBefore(_auctionStartTime):
      return StatusPillState.AuctionNotStarted;
    case _now.isAfter(_auctionStartTime) && _now.isBefore(_proposalEndTime):
      return StatusPillState.AuctionAcceptingProps;
    case _now.isAfter(_proposalEndTime) && _now.isBefore(_votingEndTime):
      return StatusPillState.AuctionVoting;
    case _now.isAfter(_votingEndTime):
      return StatusPillState.AuctionEnded;
    default:
      return StatusPillState.AuctionEnded;
  }
};

export default auctionStatus;
