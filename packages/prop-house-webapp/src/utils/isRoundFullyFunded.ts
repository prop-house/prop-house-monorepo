import { NewRound } from '../state/slices/round';

export const isRoundFullyFunded = (round: NewRound) =>
  round.funding.tokens.every(token => token.total === token.allocated);
