import { Round, RoundState } from '@prophouse/sdk-react';
import { RoundStatePartial } from './types';

export const proposerScore = (round: RoundStatePartial) => {
  switch (round.state) {
    case RoundState.AWAITING_REGISTRATION:
      return 100;
    case RoundState.NOT_STARTED:
      return 150;
    case RoundState.CANCELLED:
    case RoundState.COMPLETE:
      return 50;
    case RoundState.IN_PROPOSING_PERIOD:
      return 500;
    case RoundState.IN_VOTING_PERIOD:
      return 750;
    case RoundState.IN_CLAIMING_PERIOD:
      return 999;
    case RoundState.UNKNOWN:
      return 1;
    default:
      return 0;
  }
};

export const proposerCompare = (a: RoundStatePartial, b: RoundStatePartial) =>
  proposerScore(a) - proposerScore(b);

export const proposerSort = (rounds: Round[]): Round[] => rounds.sort(proposerCompare);
