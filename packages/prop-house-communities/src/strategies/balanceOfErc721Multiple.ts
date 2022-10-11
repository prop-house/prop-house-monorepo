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
    _communityAddress: string,
    blockTag: number,
    provider: Provider,
  ) => {
    const balances = await Promise.all(
      addresses.map(async address => {
        const contract = new Contract(address, BalanceOfABI, provider);
        const balance = await contract.balanceOf(userAddress, {
          blockTag: parseBlockTag(blockTag),
        });
        return new BigNumber(balance.toString());
      }),
    );
    return BigNumber.sum(...balances)
      .times(multiplier)
      .toNumber();
  };
};
