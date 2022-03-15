import { client } from './wrapper/subgraph';
import { gql } from '@apollo/client';
import { ethers } from 'ethers';
import { Provider } from '@ethersproject/providers';
import { delegatedVotesToAddressQuery } from './wrapper/subgraph';
import { contracts } from '.';

/**
 * Fetches number of delegated Noun votes to address
 * @param address address votes were delegated to
 * @returns number of delegated votes
 */
export const getNounerVotes = async (address: string): Promise<number> => {
  const result = await client.query({
    query: gql(delegatedVotesToAddressQuery(address.toLocaleLowerCase())),
  });

  return result.data.delegates[0]
    ? result.data.delegates[0].delegatedVotesRaw
    : 0;
};

/**
 * Fetches accumulative balance of NFTs by `address` from approved contracts
 * @param address address of owner
 * @param signerOrProvider The ethers v5 signer or provider
 * @returns number of votes
 */
export const getNounishVotes = async (
  address: string,
  provider: Provider
): Promise<number> => {
  let delegatedVotes = 0;
  for (let i = 0; i < contracts.length; i++) {
    const contract = new ethers.Contract(
      contracts[i].address,
      contracts[i].abi,
      provider
    );
    const balance = await contract.balanceOf(address);
    delegatedVotes += Number(balance);
  }
  return delegatedVotes;
};
