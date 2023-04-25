import { RoundState } from '@prophouse/sdk-react';
import filter from 'ramda/src/filter';
import { RoundStatePartial } from './types';

export const roundAllowsProposals = (round: RoundStatePartial) =>
  round.state === RoundState.IN_PROPOSING_PERIOD;

export const roundAllowsProposalsFilter = filter(roundAllowsProposals);

export const roundAllowsVoting = (round: RoundStatePartial) =>
  round.state === RoundState.IN_VOTING_PERIOD;

export const roundAllowsVotingFilter = filter(roundAllowsVoting);

export const roundAllowsClaiming = (round: RoundStatePartial) =>
  round.state === RoundState.IN_CLAIMING_PERIOD;

export const roundAllowsClaimingFilter = filter(roundAllowsClaiming);

export const activeTimedFundingRoundFilter = filter(
  (round: RoundStatePartial) => roundAllowsVoting(round) || roundAllowsProposals(round),
);

export const roundCompleted = (round: RoundStatePartial) => round.state === RoundState.COMPLETE;
