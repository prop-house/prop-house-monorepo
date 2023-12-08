import { BaseArgs } from '../actions/execStrategy';
import { StrategyFactory, _Strategy } from '../types/_Strategy';

export interface fixedNumStratArgs extends BaseArgs {
  num: number;
  addresses?: string[];
}

export const fixedNum: StrategyFactory<fixedNumStratArgs> = (
  params: fixedNumStratArgs,
): _Strategy => {
  return async () => {
    const { num, addresses, account } = params;

    if (addresses) return addresses.find(a => a.toLowerCase() == account.toLowerCase()) ? num : 0;

    return num;
  };
};
