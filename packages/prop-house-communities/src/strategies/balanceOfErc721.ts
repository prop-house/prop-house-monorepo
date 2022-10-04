import { Strategy } from '../types/Strategy';
import BalanceOfABI from '../abi/BalanceOfABI.json';
import { Contract } from 'ethers';
import BigNumber from 'bignumber.js';
import { parseBlockTag } from '../utils/parseBlockTag';
import { Provider } from '@ethersproject/providers';

/**
 * Calculates `balanceOf` for ERC-721 contract
 */
export const balanceOfErc721 = (multiplier: number = 1): Strategy => {
  return async (
    userAddress: string,
    communityAddress: string,
    blockTag: number,
    provider: Provider,
  ) => {
    const contract = new Contract(communityAddress, BalanceOfABI, provider);
    const balance = await contract.balanceOf(userAddress, { blockTag: parseBlockTag(blockTag) });
    return new BigNumber(balance.toString()).times(multiplier).toNumber();
  };
};
