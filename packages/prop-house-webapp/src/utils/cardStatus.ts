import { StoredAuctionBase } from '@nouns/prop-house-wrapper/dist/builders';
import { auctionStatus, AuctionStatus } from './auctionStatus';
import { isInfAuction } from './auctionType';

export enum ProposalCardStatus {
  Default,
  Voting,
  Winner,
}

export const cardStatus = (
  hasDelegatedVotes: boolean,
  auction: StoredAuctionBase,
): ProposalCardStatus => {
  // if infinite auction started && has votes, show voting
  if (
    isInfAuction(auction) &&
    auctionStatus(auction) === AuctionStatus.AuctionAcceptingProps &&
    hasDelegatedVotes
  )
    return ProposalCardStatus.Voting;

  // if not in voting or not eligible to vote, return default
  return auctionStatus(auction) !== AuctionStatus.AuctionVoting || !hasDelegatedVotes
    ? ProposalCardStatus.Default
    : ProposalCardStatus.Voting;
};
