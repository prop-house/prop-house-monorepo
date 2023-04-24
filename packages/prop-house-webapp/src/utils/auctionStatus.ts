import { Round, RoundState } from '@prophouse/sdk-react';

/**
 * Returns copy for deadline corresponding to auction status
 */
export const deadlineCopy = (round: Round) => {
  const stateCopy: Record<string, string> = {
    [RoundState.CANCELLED]: 'Round cancelled',
    [RoundState.NOT_STARTED]: 'Round starts',
    [RoundState.IN_PROPOSING_PERIOD]: 'Prop deadline',
    [RoundState.IN_VOTING_PERIOD]: 'Voting ends',
    [RoundState.IN_CLAIMING_PERIOD]: 'Claiming ends',
    [RoundState.COMPLETE]: 'Round ended',
  };
  return stateCopy[round.state] ?? '';
};

/**
 * Returns deadline date for corresponding to auction status
 */
export const deadlineTime = (round: Round) => {
  if (round.state === RoundState.NOT_STARTED) return round.config.proposalPeriodStartTimestamp;
  if (round.state === RoundState.IN_PROPOSING_PERIOD) return round.config.proposalPeriodEndTimestamp;
  if (round.state === RoundState.IN_VOTING_PERIOD) return round.config.votePeriodEndTimestamp;
  return round.config.claimPeriodEndTimestamp;
};
