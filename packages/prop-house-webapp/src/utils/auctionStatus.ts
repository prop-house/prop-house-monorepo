import dayjs from 'dayjs';
import { StatusPillState } from '../components/StatusPill';

/**
 * Calculates auction state
 * @param startDate auction and proposal window start time
 * @param proposalEndDate proposal window end time and voting window start time
 * @param votingEndDate voting window end time
 */
const auctionStatus = (
  startDate: Date,
  proposalEndDate: Date,
  votingEndDate: Date
): StatusPillState => {
  const _now = dayjs();
  const _auctionStartTime = dayjs(startDate);
  const _proposalEndTime = dayjs(proposalEndDate);
  const _votingEndTime = dayjs(votingEndDate);

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
