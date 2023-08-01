import { StrategyName, StrategyNames, StrategyPayload, _strategies } from '../_strategies';
import { Provider } from '@ethersproject/providers';
import { getStrategy } from '../utils/getStrategy';

/**
 * Interface to extend by strategy interfaces
 */
export interface BaseArgs {
  strategyName: StrategyName;
  account: string;
  provider: Provider;
}

export const execStrategy = async (args: StrategyPayload) => {
  if (!StrategyNames.includes(args.strategyName))
    throw new Error(`No strategy found for strategy name ${args.strategyName}`);
  const strategy = getStrategy(args.strategyName)(args);

  try {
    return await strategy();
  } catch (e) {
    throw new Error(`Error executing strategy ${args.strategyName}: ${e}`);
  }
};
