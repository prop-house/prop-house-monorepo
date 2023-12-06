import { Round, RoundType, Timed } from '@prophouse/sdk-react';

/**
 * Sort rounds, or groups of rounds, by their status.
 * Custom order: Proposing, Voting, Not Started, Ended
 */
export const sortRoundByStatus = (rounds: Round[]) => [
  ...rounds.filter(
    r => r.state === Timed.RoundState.IN_PROPOSING_PERIOD && r.type !== RoundType.TIMED,
  ),
  ...rounds.filter(
    r => r.state === Timed.RoundState.IN_PROPOSING_PERIOD && r.type === RoundType.TIMED,
  ),
  ...rounds.filter(r => r.state === Timed.RoundState.IN_VOTING_PERIOD),
  ...rounds.filter(r => r.state === Timed.RoundState.NOT_STARTED),
  ...rounds
    .filter(r => r.state > Timed.RoundState.IN_VOTING_PERIOD)
    .sort((a, b) =>
      a.config.proposalPeriodStartTimestamp > b.config.proposalPeriodStartTimestamp ? -1 : 1,
    ),
];
