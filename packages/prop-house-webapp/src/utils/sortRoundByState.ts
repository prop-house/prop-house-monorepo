import { Round, RoundState } from '@prophouse/sdk-react';

/**
 * Sort rounds, or groups of rounds, by their status.
 * Custom order: Proposing, Voting, Not Started, Ended
 */
export const sortRoundByState = (rounds: Round[]) => [
  // TODO: Support both timed funding and infinite funding. Add state function to the Round Manager class.
  ...rounds.filter(
    round => round.state === RoundState.IN_PROPOSING_PERIOD // && isTimedAuction(round), TODO: Update timed funding support
  ),
  ...rounds.filter(round => round.state === RoundState.IN_VOTING_PERIOD),
  ...rounds.filter(round => round.state === RoundState.IN_CLAIMING_PERIOD),
  ...rounds.filter(round => round.state === RoundState.NOT_STARTED),
  ...rounds.filter(round => round.state === RoundState.COMPLETE),
  ...rounds.filter(round => round.state === RoundState.CANCELLED)
    .sort((a, b) => (a.config?.proposalPeriodStartTimestamp > b.config?.proposalPeriodStartTimestamp ? -1 : 1)),
];
