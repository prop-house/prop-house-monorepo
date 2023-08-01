import { BaseArgs } from '../actions/execStrategy';
import { StrategyFactory, _Strategy } from '../types/_Strategy';

export interface fixedNumStratArgs extends BaseArgs {
  num: number;
}

export const fixedNum: StrategyFactory<fixedNumStratArgs> = (
  params: fixedNumStratArgs,
): _Strategy => {
  return async () => {
    const { num } = params;
    return num;
  };
};
