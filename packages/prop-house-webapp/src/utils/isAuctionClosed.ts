import { StoredAuction } from '@nouns/prop-house-wrapper/dist/builders';
import isAuctionActive from './isAuctionActive';

/**
 * Auction is not accepting proposals
 */
const isAuctionClosed = (auction: StoredAuction) => !isAuctionActive(auction);

export default isAuctionClosed;
