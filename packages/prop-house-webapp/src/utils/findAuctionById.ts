import { StoredTimedAuction } from '@nouns/prop-house-wrapper/dist/builders';
import firstOrNull from './firstOrNull';

export const findAuctionById = (id: number, auctions: StoredTimedAuction[]) =>
  firstOrNull(auctions.filter(a => a.id === id));
