import { communities } from '../communities';
import { Provider } from '@ethersproject/providers';

export const getRelevantComms = async (
  userAddress: string,
  provider: Provider,
  blockTag: number,
): Promise<{ [key: string]: number }> => {
  // get all votes from all communities for user
  const allVotes = await Promise.all(
    Array.from(communities).map(comm => comm[1](userAddress, comm[0], blockTag, provider)),
  );

  // map community addresses to votes
  const nonZeroVoteCommunities = Array.from(communities.keys())
    .map((address, index) => ({ [address]: allVotes[index] }))
    .filter(obj => Object.values(obj)[0] !== 0)
    .reduce((accumulator, current) => ({ ...accumulator, ...current }), {});

  return nonZeroVoteCommunities;
};
