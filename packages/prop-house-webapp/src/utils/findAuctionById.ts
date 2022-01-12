import { StoredAuction } from "@nouns/prop-house-wrapper/dist/builders";
import firstOrNull from "./firstOrNull";

export const findAuctionById = (id: number, auctions: StoredAuction[]) =>
  firstOrNull(auctions.filter((a) => a.id === id));
