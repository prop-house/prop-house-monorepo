import { Strategy } from '../types/Strategy';
import BalanceOfABI from '../abi/BalanceOfABI.json';
import { Contract } from 'ethers';
import { BigNumber } from 'bignumber.js';
import { parseBlockTag } from '../utils/parseBlockTag';
import { Provider } from '@ethersproject/providers';
import { formatUnits } from 'ethers/lib/utils';

/**
 * Calculates `balanceOf` for ERC20 contract
 */
export const balanceOfErc20 = (decimals: number, multiplier: number = 1): Strategy => {
  return async (
    userAddress: string,
    communityAddress: string,
    blockTag: string,
    provider: Provider,
  ) => {
    const contract = new Contract(communityAddress, BalanceOfABI, provider);
    const balance = await contract.balanceOf(userAddress, { blockTag: parseBlockTag(blockTag) });
    return new BigNumber(formatUnits(balance, decimals).toString()).times(multiplier).toNumber();
  };
};
