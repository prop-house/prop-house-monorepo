import { Proposal, Round, RoundState } from '@prophouse/sdk-react';
import { sortByVotesAndHandleTies } from './sortByVotesAndHandleTies';

const getWinningIds = (proposals: Proposal[], round: Round) => {
  // Not implemented
  // if (isInfAuction(round))
  //   return proposals.filter(p => p.voteCount >= round.quorum).map(p => p.id);

  // empty array to store winning ids
  const winningIds: number[] = [];

  // return empty array if auction is accepting proposals or has not started
  if ([RoundState.AWAITING_REGISTRATION, RoundState.NOT_STARTED, RoundState.IN_PROPOSING_PERIOD].includes(round.state)) {
    return winningIds;
  }

  // sort the proposals by votes and handle ties
  const sortedProposals = proposals && sortByVotesAndHandleTies(proposals.slice(), false);

  // push the winning ids to the array
  sortedProposals &&
    sortedProposals.slice(0, round.config.winnerCount).map(p =>
      round.state === RoundState.IN_VOTING_PERIOD
        ? // skip proposals with 0 votes if auction is in voting phase
          BigInt(p.votingPower) !== BigInt(0) && winningIds.push(p.id)
        : winningIds.push(p.id),
    );

  return winningIds;
};

export default getWinningIds;
