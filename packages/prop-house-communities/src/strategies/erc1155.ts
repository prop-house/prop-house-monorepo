import { Strategy } from '../types/Strategy';
import BalanceOf1155ABI from '../abi/BalanceOf1155ABI.json';
import { parseBlockTag } from '../utils/parseBlockTag';
import { Provider } from '@ethersproject/providers';
import { Contract } from 'ethers';
import BigNumber from 'bignumber.js';

/**
 * Calculates `balanceOf` for specific token id within 1155 contract
 */
export const erc1155 = (tokenId: number, multiplier: number = 1): Strategy => {
  return async (
    userAddress: string,
    communityAddress: string,
    blockTag: string,
    provider: Provider,
  ) => {
    const contract = new Contract(communityAddress, BalanceOf1155ABI, provider);
    const balance = await contract.balanceOf(userAddress, tokenId, {
      blockTag: parseBlockTag(blockTag),
    });
    return new BigNumber(balance.toString()).times(multiplier).toNumber();
  };
};
