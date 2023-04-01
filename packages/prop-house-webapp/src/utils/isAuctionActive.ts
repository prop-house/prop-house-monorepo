import { StoredAuctionBase } from '@nouns/prop-house-wrapper/dist/builders';
import dayjs from 'dayjs';
import { isInfAuction } from './auctionType';

/**
 * Auction is has started and is accepting proposals.
 */
const isAuctionActive = (auction: StoredAuctionBase) => {
  const auctionStarted = dayjs().isAfter(dayjs(auction.startTime));

  if (isInfAuction(auction)) return auctionStarted;
  return auctionStarted && dayjs().isBefore(dayjs(auction.proposalEndTime));
};

export default isAuctionActive;
