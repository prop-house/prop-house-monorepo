import { Round, RoundState } from '@prophouse/sdk-react';
import { isInfAuction } from './auctionType';

export enum ProposalCardStatus {
  Default,
  Voting,
  Winner,
}

export const cardStatus = (
  hasDelegatedVotes: boolean,
  round: Round,
): ProposalCardStatus => {
  // if infinite auction started && has votes, show voting
  // TODO Infinite rounds not yet supported
  // if (
  //   isInfAuction(round) &&
  //   auctionStatus(round) === AuctionStatus.AuctionAcceptingProps &&
  //   hasDelegatedVotes
  // )
  //   return ProposalCardStatus.Voting;

  // if not in voting or not eligible to vote, return default
  return round.state !== RoundState.IN_VOTING_PERIOD || !hasDelegatedVotes
    ? ProposalCardStatus.Default
    : ProposalCardStatus.Voting;
};
