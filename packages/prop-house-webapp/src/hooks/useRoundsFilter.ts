import { useState } from 'react';

export enum RoundsFilter {
  Favorites = 'Favorites',
  Recent = 'Recent',
  Proposing = 'Proposing',
  Voting = 'Voting',
}

const DEFAULT_FILTER = RoundsFilter.Recent;

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
