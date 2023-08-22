import { balanceOfErc721, balanceOfErc721StratArgs } from './balanceOfErc721';
import { balanceOfErc20, balanceOfErc20StratArgs } from './balanceOfErc20';
import { fixedNum, fixedNumStratArgs } from './fixedNum';
import { validEnsAndMinBal, validEnsAndMinBalStratArgs } from './validEnsAndMinBal';
import { minimumBalance, minimumBalanceStratArgs } from './minimumBalance';

export const StrategyNames = [
  'balanceOfErc721',
  'balanceOfErc20',
  'fixedNum',
  'validEnsAndMinBal',
  'minimumBalance',
] as const;

export type StrategyName = typeof StrategyNames[number];

export type StrategyPayload =
  | balanceOfErc20StratArgs
  | balanceOfErc721StratArgs
  | fixedNumStratArgs
  | validEnsAndMinBalStratArgs
  | minimumBalanceStratArgs;

export const _strategies = {
  balanceOfErc721: balanceOfErc721,
  balanceOfErc20: balanceOfErc20,
  fixedNum: fixedNum,
  validEnsAndMinBal: validEnsAndMinBal,
  minimumBalance: minimumBalance,
};
