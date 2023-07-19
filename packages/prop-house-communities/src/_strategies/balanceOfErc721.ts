import BalanceOfABI from '../abi/BalanceOfABI.json';
import { Contract } from 'ethers';
import BigNumber from 'bignumber.js';
import { parseBlockTag } from '../utils/parseBlockTag';
import { _Strategy } from '../types/_Strategy';
import { BaseArgs } from '../actions/execStrategy';

export interface balanceOfErc712StratArgs extends BaseArgs {
  contract: string;
  multiplier: number;
}

/**
 * Calculates `balanceOf` for ERC-721 contract
 */
export const balanceOfErc721 = (params: balanceOfErc712StratArgs): _Strategy => {
  return async () => {
    const { account, contract, blockTag, provider, multiplier } = params;
    const _contract = new Contract(contract, BalanceOfABI, provider);
    const balance = await _contract.balanceOf(account, { blockTag: parseBlockTag(blockTag) });
    return new BigNumber(balance.toString()).times(multiplier).toNumber();
  };
};
