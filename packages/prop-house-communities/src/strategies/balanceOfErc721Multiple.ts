import { Strategy } from '../types/Strategy';
import BalanceOfABI from '../abi/BalanceOfABI.json';
import { Contract } from 'ethers';
import BigNumber from 'bignumber.js';
import { parseBlockTag } from '../utils/parseBlockTag';
import { Provider } from '@ethersproject/providers';

/**
 * Calculates `balanceOf` for multiple ERC-721 contracts
 */
export const balanceOfErc721Multiple = (addresses: string[], multiplier: number = 1): Strategy => {
  return async (
    userAddress: string,
    communityAddress: string,
    blockTag: number,
    provider: Provider,
  ) => {
    let sum = new BigNumber(0);
    for (let i = 0; i < addresses.length; i++) {
      const contract = new Contract(addresses[i], BalanceOfABI, provider);
      const balance = await contract.balanceOf(userAddress, { blockTag: parseBlockTag(blockTag) });
      sum = sum.plus(new BigNumber(balance.toString()));
    }
    return sum.times(multiplier).toNumber();
  };
};
