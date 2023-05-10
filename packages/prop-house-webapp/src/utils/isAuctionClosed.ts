import { StoredTimedAuction } from '@nouns/prop-house-wrapper/dist/builders';
import isAuctionActive from './isAuctionActive';

/**
 * Auction is not accepting proposals
 */
const isAuctionClosed = (auction: StoredTimedAuction) => !isAuctionActive(auction);

export default isAuctionClosed;
