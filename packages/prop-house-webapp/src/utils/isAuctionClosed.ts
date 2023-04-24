import { Round } from '@prophouse/sdk-react';
import isAuctionActive from './isAuctionActive';

/**
 * Auction is not accepting proposals
 */
const isAuctionClosed = (round: Round) => !isAuctionActive(round);

export default isAuctionClosed;
