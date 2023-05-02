import { StoredTimedAuction } from '@nouns/prop-house-wrapper/dist/builders';

const highestAuctionId = (auctions: StoredTimedAuction[]): number =>
  auctions.reduce((acc, auction) => {
    acc = auction.id > acc ? auction.id : acc;
    return acc;
  }, 0);

export default highestAuctionId;
