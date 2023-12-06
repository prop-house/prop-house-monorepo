import { useState } from 'react';

export const getFavoriteCommunities = (): string[] => {
  const favs = localStorage.getItem('favorites');
  return favs ? JSON.parse(favs) : [];
};

export const useFavoriteCommunities = () => {
  const [favoriteCommunities, setFavoriteCommunities] = useState<string[]>(
    getFavoriteCommunities(),
  );

  const isFavoriteCommunity = (houseAddress: string) => {
    return favoriteCommunities.includes(houseAddress);
  };

  const addFavoriteCommunity = (houseAddress: string) => {
    const updatedCommunities = [...favoriteCommunities, houseAddress];
    setFavoriteCommunities(updatedCommunities);
    localStorage.setItem('favorites', JSON.stringify(updatedCommunities));
  };

  const removeFavoriteCommunity = (houseAddress: string) => {
    const updatedCommunities = favoriteCommunities.filter(address => address !== houseAddress);
    setFavoriteCommunities(updatedCommunities);
    localStorage.setItem('favorites', JSON.stringify(updatedCommunities));
  };

  return {
    favoriteCommunities,
    isFavoriteCommunity,
    addFavoriteCommunity,
    removeFavoriteCommunity,
  };
};
