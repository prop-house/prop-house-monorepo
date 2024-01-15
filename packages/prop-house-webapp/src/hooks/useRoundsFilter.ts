import { useState } from 'react';

export enum RoundsFilter {
  Favorites = 'Favorites',
  Relevant = 'Relevant',
  Proposing = 'Proposing',
  Voting = 'Voting',
}

const DEFAULT_FILTER = RoundsFilter.Relevant;

const getFilter = (): RoundsFilter => {
  const filter = localStorage.getItem('filter');
  if (filter === 'Active' || filter === 'Recent') localStorage.setItem('filter', 'Relevant'); // removing old filter default
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
