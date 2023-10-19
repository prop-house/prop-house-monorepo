import { balanceOfErc721, balanceOfErc721StratArgs } from './balanceOfErc721';
import { balanceOfErc20, balanceOfErc20StratArgs } from './balanceOfErc20';
import { fixedNum, fixedNumStratArgs } from './fixedNum';
import { validEnsAndMinBal, validEnsAndMinBalStratArgs } from './validEnsAndMinBal';
import { thankApe, thankApeStratArgs } from './thankApe';
import { minimumBalance, minimumBalanceStratArgs } from './minimumBalance';
import { balanceOfErc1155, balanceOfErc1155StratArgs } from './balanceOfErc1155';
import { nounsDelegatedVotes, nounsDelegatedVotesStratArgs } from './nounsDelegatedVotes';
import { kiwi } from './kiwi';

export const StrategyNames = [
  'balanceOfErc721',
  'balanceOfErc20',
  'fixedNum',
  'validEnsAndMinBal',
  'thankApe',
  'minimumBalance',
  'balanceOfErc1155',
  'nounsDelegatedVotes',
  'kiwi',
] as const;

export type StrategyName = typeof StrategyNames[number];

export type StrategyPayload =
  | balanceOfErc20StratArgs
  | balanceOfErc721StratArgs
  | fixedNumStratArgs
  | validEnsAndMinBalStratArgs
  | thankApeStratArgs
  | minimumBalanceStratArgs
  | balanceOfErc1155StratArgs
  | nounsDelegatedVotesStratArgs;

export const _strategies = {
  balanceOfErc721: balanceOfErc721,
  balanceOfErc20: balanceOfErc20,
  fixedNum: fixedNum,
  validEnsAndMinBal: validEnsAndMinBal,
  thankApe: thankApe,
  minimumBalance: minimumBalance,
  balanceOfErc1155: balanceOfErc1155,
  nounsDelegatedVotes: nounsDelegatedVotes,
  kiwi: kiwi,
};
