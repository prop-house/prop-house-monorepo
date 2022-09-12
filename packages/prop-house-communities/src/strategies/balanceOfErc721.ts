import { Strategy } from '../types/Strategy';
import BalanceOfABI from '../abi/BalanceOfABI.json';
import { Contract, BigNumber, utils } from 'ethers';
import { parseBlockTag } from '../utils/parseBlockTag';
import { Provider } from '@ethersproject/providers';

/**
 * Calculates `balanceOf` for ERC-721 contract
 */
export const balanceOfErc721 = (multiplier: number = 1): Strategy => {
  return async (
    userAddress: string,
    communityAddress: string,
    blockTag: string,
    provider: Provider,
  ) => {
    const contract = new Contract(communityAddress, BalanceOfABI, provider);
    const bal = BigNumber.from(
      await contract.balanceOf(userAddress, { blockTag: parseBlockTag(blockTag) }),
    );

    const parsedBal = bal.toNumber();
    if (!parsedBal) throw new Error('Error fetching `blanceOf` for ERC721');

    return parsedBal * multiplier;
  };
};
