import { _Strategy } from '../types/_Strategy';
import { getStrategy } from '../utils/getStrategy';
import { Provider } from '@ethersproject/providers';

/**
 * Interface to extend by strategy interfaces
 */
export interface BaseArgs {
  strategyName: string;
  account: string;
  provider: Provider;
}

export const execStrategy = async (args: any) => {
  const strategy = getStrategy(args.strategyName);
  if (!strategy) throw new Error(`No strategy found for strategy name ${args.strategyName}`);

  try {
    return await strategy(args)();
  } catch (e) {
    throw new Error(`Error executing strategy ${args.strategyName}: ${e}`);
  }
};
