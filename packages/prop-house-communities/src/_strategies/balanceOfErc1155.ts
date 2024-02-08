import { StrategyFactory, _Strategy } from '../types/_Strategy';
import { BaseArgs } from '../actions/execStrategy';
import BalanceOf1155ABI from '../abi/BalanceOf1155ABI.json';
import { parseBlockTag } from '../utils/parseBlockTag';
import { Contract } from 'ethers';
import BigNumber from 'bignumber.js';

export interface balanceOfErc1155StratArgs extends BaseArgs {
  contract: string;
  tokenIds: number[];
  multiplier: number;
  blockTag?: number;
}

/**
 * Calculates `balanceOf` for specific token ids within 1155 contract
 */
export const balanceOfErc1155: StrategyFactory<balanceOfErc1155StratArgs> = (
  params: balanceOfErc1155StratArgs,
): _Strategy => {
  return async () => {
    const { contract, tokenIds, multiplier, blockTag, provider, account } = params;

    const _contract = new Contract(contract, BalanceOf1155ABI, provider);
    const accountsArr = Array(tokenIds.length).fill(account);

    const balances = (await _contract.balanceOfBatch(accountsArr, tokenIds, {
      blockTag: parseBlockTag(blockTag),
    })) as BigNumber[];

    const sumOfBalances = balances.reduce((prev, current) => prev + current.toNumber(), 0);
    return sumOfBalances * multiplier;
  };
};
