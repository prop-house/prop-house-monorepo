import { StrategyName, _strategies } from '../_strategies';
import { BaseArgs } from '../actions/execStrategy';
import { StrategyFactory } from '../types/_Strategy';

export type UnresolvedStrategy = Object & BaseArgs;

/**
 * Resolve a strategy for validation or execution, if developing against
 * a specific strategy, select using the mapped object _strategies.
 */
export const getStrategy = (strategyName: StrategyName): StrategyFactory<UnresolvedStrategy> => {
  return _strategies[strategyName] as unknown as StrategyFactory<UnresolvedStrategy>;
};
