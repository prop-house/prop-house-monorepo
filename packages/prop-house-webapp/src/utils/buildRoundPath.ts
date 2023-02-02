import { Community, AuctionBase } from '@nouns/prop-house-wrapper/dist/builders';
import { nameToSlug } from './communitySlugs';

/**
 * build url path to round (/:community-name/:round-name)
 */
export const buildRoundPath = (community: Community, round: AuctionBase) =>
  `/${nameToSlug(community.name)}/${nameToSlug(round.title)}`;
