import { Strategy } from '../types/Strategy';
import { ethers } from 'ethers';
import { communityAddresses } from '../addresses';
import BalanceOfABI from '../abi/BalanceOfABI.json';
import { parseBlockTag } from '../utils/parseBlockTag';

/**
 * The sum of balanceOf from two communities: OnChain Monkey and Karma Monkey
 */
export const onchainmonkey: Strategy = {
  address: communityAddresses.onchainMonkey,
  numVotes: async (
    userAddress: string,
    provider,
    commmunityAddress,
    blockTag: string = 'latest',
  ) => {
    const karmaContract = new ethers.Contract(
      communityAddresses.karmaMonkey,
      BalanceOfABI,
      provider,
    );
    const ocmContract = new ethers.Contract(
      communityAddresses.onchainMonkey,
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

      return ethers.BigNumber.from(karmaVotes).add(ethers.BigNumber.from(ocmVotes)).toNumber();
    } catch (e) {
      console.log(`error counting votes community: ${commmunityAddress}: ${e}`);
      return 0;
    }
  },
};
