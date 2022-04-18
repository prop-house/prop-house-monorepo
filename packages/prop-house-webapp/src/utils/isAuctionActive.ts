import { StoredAuction } from '@nouns/prop-house-wrapper/dist/builders';
import dayjs from 'dayjs';

/**
 * Auction is has started and is accepting proposals.
 */
const isAuctionActive = (auction: StoredAuction) =>
  dayjs().isAfter(dayjs(auction.startTime)) &&
  dayjs().isBefore(dayjs(auction.proposalEndTime));

export default isAuctionActive;
