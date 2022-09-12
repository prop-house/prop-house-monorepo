import { Strategy } from '../types/Strategy';
import BalanceOfABI from '../abi/BalanceOfABI.json';
import { Contract, BigNumber } from 'ethers';
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
    const bal = BigNumber.from(
      await contract.balanceOf(userAddress, { blockTag: parseBlockTag(blockTag) }),
    );
    if (!bal) throw new Error('Error fetching `blanceOf` for ERC20');

    const parsedBal = parseFloat(formatUnits(bal, decimals));
    return parsedBal * multiplier;
  };
};
