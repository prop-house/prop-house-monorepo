import { communityRoundStrategies } from '../round-strategies';
import { Strategy } from '../types/Strategy';

/**
 * Gets the strategy for a round by its `id` and parent community contract address
 */
export const strategyForRound = (
  roundId: number,
  communityAddress: string,
): Strategy | undefined => {
  const roundStrats = communityRoundStrategies.get(communityAddress);
  if (!roundStrats)
    throw new Error(`Round strategies not found for community with address: ${communityAddress}`);
  return roundStrats[roundId];
};
