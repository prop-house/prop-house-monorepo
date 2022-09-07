import { client } from '../subgraph/client';
import { nounsDelegatedVotesToAddressQuery } from '../subgraph/nounsQuery';
import { gql } from '@apollo/client';
import { Contract } from './types';
import { ethers } from 'ethers';
import BalanceOfABI from '../abi/BalanceOfABI.json';
import { Provider } from '@ethersproject/providers';
import { parseBlockTag } from '../utils/parseBlockTag';

/**
 * Strategy for OnchainMonkey and KarmaMonkey communities. Uses sum of `balanceOf` from each community.
 */
const onChainMonkeyStrategy = async (
  userAddress: string,
  provider: Provider,
  commmunityAddress: string,
  blockTag: string = 'latest',
) => {
  const karmaMonkeyAddress = '0x86cc280d0bac0bd4ea38ba7d31e895aa20cceb4b';
  const ocmMonkeyAddress = '0x960b7a6bcd451c9968473f7bbfd9be826efd549a';

  const karmaContract = new ethers.Contract(karmaMonkeyAddress, BalanceOfABI, provider);
  const ocmContract = new ethers.Contract(ocmMonkeyAddress, BalanceOfABI, provider);

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
};

/**
 * Contracts of communities that an alternative appraoch to a `balanceOf` call to calculate votes.
 */
export const contracts: Contract[] = [
  {
    address: '0x9c8ff314c9bc7f6e59a9d9225fb22946427edc03',
    numVotes: async (
      userAddress: string,
      provider,
      commmunityAddress,
      blockTag: string = 'latest',
    ) => {
      const result = await client.query({
        query: gql(nounsDelegatedVotesToAddressQuery(userAddress.toLocaleLowerCase(), blockTag)),
      });

      return result.data.delegates[0] ? result.data.delegates[0].delegatedVotesRaw : 0;
    },
    multiplier: 10,
  },
  {
    address: '0x960b7a6bcd451c9968473f7bbfd9be826efd549a',
    numVotes: async (
      userAddress: string,
      provider,
      commmunityAddress,
      blockTag: string = 'latest',
    ) => {
      return await onChainMonkeyStrategy(userAddress, provider, commmunityAddress, blockTag);
    },
  },
  {
    address: '0x86cc280d0bac0bd4ea38ba7d31e895aa20cceb4b',
    numVotes: async (
      userAddress: string,
      provider,
      commmunityAddress,
      blockTag: string = 'latest',
    ) => {
      return await onChainMonkeyStrategy(userAddress, provider, commmunityAddress, blockTag);
    },
  },
];
