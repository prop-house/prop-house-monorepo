import { House } from '@prophouse/sdk-react';

/**
 * Returns sorted array of houses with favorite communities first
 */
export const sortHousesForFavs = (houses: House[], favCommunities: string[]) => {
  return houses.sort((a, b) => {
    const isAInFavorites = favCommunities.includes(a.address);
    const isBInFavorites = favCommunities.includes(b.address);

    if (isAInFavorites && !isBInFavorites) {
      return -1;
    } else if (!isAInFavorites && isBInFavorites) {
      return 1;
    } else {
      return 0;
    }
  });
};
