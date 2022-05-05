import { StoredAuction } from '@nouns/prop-house-wrapper/dist/builders';
import { auctionStatus, AuctionStatus } from './auctionStatus';

export enum ProposalCardStatus {
  Default,
  Voting,
  Winner,
}

export const cardStatus = (
  hasDelegatedVotes: boolean,
  auction: StoredAuction
): ProposalCardStatus => {
  // if not in voting or not eligible to vote, return default
  return auctionStatus(auction) !== AuctionStatus.AuctionVoting ||
    !hasDelegatedVotes
    ? ProposalCardStatus.Default
    : ProposalCardStatus.Voting;
};
