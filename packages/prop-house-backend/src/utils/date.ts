import { AuctionBase } from 'src/auction/auction-base.type';
import { Auction } from 'src/auction/auction.entity';

export const ParseDate = (str) => new Date(str);

export const canSubmitProposals = (auction: AuctionBase): boolean =>
  auction.isAcceptingProposals();
