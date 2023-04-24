import { Round, RoundType } from '@prophouse/sdk-react';

// NOt yet supported
export const isInfAuction = (
  _round: Round
) => false; // round.type === RoundType.TIMED_FUNDING;

export const isTimedAuction = (
  round: Round
) => round.type === RoundType.TIMED_FUNDING;
