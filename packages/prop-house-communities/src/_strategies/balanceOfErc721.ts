import { Strategy } from '../types/Strategy';
import BalanceOfABI from '../abi/BalanceOfABI.json';
import { Contract } from 'ethers';
import BigNumber from 'bignumber.js';
import { parseBlockTag } from '../utils/parseBlockTag';
import { Provider } from '@ethersproject/providers';
import { _Strategy } from '../types/_Strategy';

export type balanceOfErc712StratArgs = {
  account: string;
  contract: string;
  blockTag: number;
  provider: Provider;
  multiplier: number;
};

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
