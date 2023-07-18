import { balanceOfErc20StratArgs } from '../_strategies/balanceOfErc20';
import { balanceOfErc712StratArgs } from '../_strategies/balanceOfErc721';
import { _Strategy } from '../types/_Strategy';
import { getStrategy } from '../utils/getStrategy';

const execStrategy = async (strategyName: string, args: any) => {
  const strategy = getStrategy(strategyName);
  if (!strategy) throw new Error(`No strategy found for strategy name ${strategyName}`);

  try {
    return await strategy(args)();
  } catch (e) {
    throw new Error(`Error executing strategy ${strategyName}: ${e}`);
  }
};

export const execBalanceOfErc20Strategy = async (
  strategyName: string,
  args: balanceOfErc20StratArgs,
) => execStrategy(strategyName, args);

export const execBalanceOfErc721Strategy = async (
  strategyName: string,
  args: balanceOfErc712StratArgs,
) => execStrategy(strategyName, args);
