import { client } from '../subgraph/client';
import { nounsDelegatedVotesToAddressQuery } from '../subgraph/nounsQuery';
import { gql } from '@apollo/client';
import { Provider } from '@ethersproject/providers';
import { ethers } from 'ethers';
import LilNounsABI from '../abi/LilNounsABI.json';

/**
 * Contract representing a community with an alternative method for fetching votes.
 *
 * @interface CommunityContract
 * @address Contract address for community
 * @numVotes Method to use for fetching number of votes that `userAddress` has allotted
 * @multiplier [optional] multiplier of votes. number to be used against default number of votes (e.g. make each nft count as 10 votes instead of 1)
 */
export interface CommunityContract {
  address: string;
  numVotes: (
    userAddress: string,
    communityAddress: string,
    provider: Provider
  ) => Promise<number>;
  multiplier?: number;
}

/**
 * Contracts of communities that use an alternative approach to a `balanceOf` call to calculate votes.
 */
export const contracts: CommunityContract[] = [
  {
    address: '0x9c8ff314c9bc7f6e59a9d9225fb22946427edc03',
    numVotes: async (userAddress: string) => {
      const result = await client.query({
        query: gql(
          nounsDelegatedVotesToAddressQuery(userAddress.toLocaleLowerCase())
        ),
      });

      return result.data.delegates[0]
        ? result.data.delegates[0].delegatedVotesRaw
        : 0;
    },
    multiplier: 10,
  },
  {
    address: '0x4b10701bfd7bfedc47d50562b76b436fbb5bdb3b',
    numVotes: async (
      userAddress: string,
      commmunityAddress: string,
      provider: Provider
    ) => {
      const contract = new ethers.Contract(
        commmunityAddress,
        LilNounsABI,
        provider
      );

      return ethers.BigNumber.from(
        await contract.getCurrentVotes(userAddress)
      ).toNumber();
    },
  },
];
