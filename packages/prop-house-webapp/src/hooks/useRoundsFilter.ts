import { useState } from 'react';

export enum RoundsFilter {
  Relevant = 'Relevant',
  Favorites = 'Favorites',
}

const getFilter = (): RoundsFilter | undefined => {
  const filter = localStorage.getItem('filter');
  return filter ? (filter as RoundsFilter) : RoundsFilter.Relevant;
};

export const useRoundsFilter = () => {
  const [roundsFilter, setRoundsFilter] = useState<RoundsFilter | undefined>(getFilter());

  const updateRoundsFilter = (value: RoundsFilter) => {
    setRoundsFilter(value);
    localStorage.setItem('filter', value);
  };

  return {
    roundsFilter,
    updateRoundsFilter,
  };
};
