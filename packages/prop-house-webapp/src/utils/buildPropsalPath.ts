import { Auction, Community } from '@nouns/prop-house-wrapper/dist/builders';
import { nameToSlug } from './communitySlugs';

/**
 * build url path to proposal (/:community-name/:round-name/:proposal-id)
 */
export const buildProposalPath = (community: Community, round: Auction, propId: number) =>
  `prop.house/${nameToSlug(community.name)}/${nameToSlug(round.title)}/${propId}`;
