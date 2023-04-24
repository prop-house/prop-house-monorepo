import { Round } from '@prophouse/sdk-react';
import dayjs from 'dayjs';
import { isInfAuction } from './auctionType';

/**
 * Auction is has started and is accepting proposals.
 */
const isAuctionActive = (round: Round) => {
  const auctionStarted = dayjs().isAfter(dayjs.unix(round.config.proposalPeriodStartTimestamp));

  if (isInfAuction(round)) return auctionStarted;
  return auctionStarted && dayjs().isBefore(dayjs.unix(round.config.proposalPeriodEndTimestamp));
};

export default isAuctionActive;
