import { StoredAuction } from "@nouns/prop-house-wrapper/dist/builders";

const highestAuctionId = (auctions: StoredAuction[]): number =>
  auctions.reduce((acc, auction) => {
    acc = auction.id > acc ? auction.id : acc;
    return acc;
  }, 0);

export default highestAuctionId;
