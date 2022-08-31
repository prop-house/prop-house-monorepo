import { communityAddresses } from '../addresses';
import { Strategy } from '../types/Strategy';
import { erc1155 } from './erc1155';
import { nouns } from './nouns';
import { onchainmonkey } from './onchainmonkey';

/**
 * Custom voting strategies for communities.
 */
export const strategies = {
  nouns,
  onchainmonkey,
  theNounSquareTeamRewards: erc1155(communityAddresses.theNounSquareTeamRewards, 1, 100),
  theNounSquareContests: erc1155(communityAddresses.theNounSquareContests, 2, 1),
};
