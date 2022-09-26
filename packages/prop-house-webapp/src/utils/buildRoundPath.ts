import { CommunityWithAuctions } from '@nouns/prop-house-wrapper/dist/builders';
import { nameToSlug } from './communitySlugs';

/**
 * when /:house/:round/:id is the entry point, the round is not yet
 * avail for back button so it has to be fetched.
 */
const buildRoundPath = (community: CommunityWithAuctions, roundTitle: string) => {
  const round = community.auctions.filter(
    r => nameToSlug(r.title.toString()) === nameToSlug(roundTitle),
  );

  const path = nameToSlug(round[0].title);
  return path;
};

export default buildRoundPath;
