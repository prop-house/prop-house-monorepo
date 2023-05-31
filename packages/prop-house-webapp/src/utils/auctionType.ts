import {
  AuctionBase,
  StoredAuctionBase,
  StoredInfiniteAuction,
  StoredTimedAuction,
} from '@nouns/prop-house-wrapper/dist/builders';

export const isInfAuction = (
  auction: StoredAuctionBase | AuctionBase,
): auction is StoredInfiniteAuction => 'quorumFor' in auction;

export const isTimedAuction = (
  auction: StoredAuctionBase | AuctionBase,
): auction is StoredTimedAuction => !('quorumFor' in auction);
