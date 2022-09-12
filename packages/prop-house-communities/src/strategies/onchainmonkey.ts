import { Contract, BigNumber } from 'ethers';
import BalanceOfABI from '../abi/BalanceOfABI.json';
import { parseBlockTag } from '../utils/parseBlockTag';
import { Provider } from '@ethersproject/providers';
import { Strategy } from '../types/Strategy';

/**
 * The sum of balanceOf from two communities: OnChain Monkey and Karma Monkey
 */
export const onchainMonkey = (): Strategy => {
  return async (
    userAddress: string,
    communityAddress: string,
    multiplier: number,
    blockTag: string,
    provider: Provider,
  ) => {
    const karmaContract = new Contract(
      '0x86cc280d0bac0bd4ea38ba7d31e895aa20cceb4b', // karma monkey contract address
      BalanceOfABI,
      provider,
    );
    const ocmContract = new Contract(
      '0x960b7a6bcd451c9968473f7bbfd9be826efd549a', // onchain monkey contract address
      BalanceOfABI,
      provider,
    );

    try {
      const karmaVotes = await karmaContract.balanceOf(userAddress, {
        blockTag: parseBlockTag(blockTag),
      });
      const ocmVotes = await ocmContract.balanceOf(userAddress, {
        blockTag: parseBlockTag(blockTag),
      });

      return BigNumber.from(karmaVotes).add(BigNumber.from(ocmVotes)).toNumber();
    } catch (e) {
      return 0;
    }
  };
};
