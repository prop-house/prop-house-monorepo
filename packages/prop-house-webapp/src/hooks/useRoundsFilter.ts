import { useState } from 'react';

export enum RoundsFilter {
  Relevant = 'Relevant',
  Favorites = 'Favorites',
  Active = 'Active',
}

const DEFAULT_FILTER = RoundsFilter.Active;

const getFilter = (): RoundsFilter => {
  const filter = localStorage.getItem('filter');
  return filter ? (filter as RoundsFilter) : DEFAULT_FILTER;
};

export const useRoundsFilter = () => {
  const [roundsFilter, setRoundsFilter] = useState<RoundsFilter>(getFilter());

  const updateRoundsFilter = (value: RoundsFilter) => {
    setRoundsFilter(value);
    localStorage.setItem('filter', value);
  };

  return {
    roundsFilter,
    updateRoundsFilter,
  };
};
