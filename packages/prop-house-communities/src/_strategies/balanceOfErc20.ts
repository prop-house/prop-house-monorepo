import { _Strategy } from '../types/_Strategy';
import BalanceOfABI from '../abi/BalanceOfABI.json';
import { Contract } from 'ethers';
import { BigNumber } from 'bignumber.js';
import { parseBlockTag } from '../utils/parseBlockTag';
import { Provider } from '@ethersproject/providers';
import { formatUnits } from 'ethers/lib/utils';

export type balanceOfErc20StratArgs = {
  account: string;
  contract: string;
  blockTag: number;
  provider: Provider;
  decimals: number;
  multiplier: number;
};

/**
 * Calculates `balanceOf` for ERC20 contract
 */
export const balanceOfErc20 = (params: balanceOfErc20StratArgs): _Strategy => {
  return async () => {
    const { account, contract, provider, blockTag, decimals, multiplier } = params;
    const _contract = new Contract(contract, BalanceOfABI, provider);
    const balance = await _contract.balanceOf(account, { blockTag: parseBlockTag(blockTag) });
    return new BigNumber(formatUnits(balance, decimals).toString()).times(multiplier).toNumber();
  };
};
