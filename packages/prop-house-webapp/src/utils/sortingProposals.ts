import { StoredProposalWithVotes } from '@nouns/prop-house-wrapper/dist/builders';
import dayjs from 'dayjs';
import { sortProposals } from '../state/slices/propHouse';
import { Dispatch } from 'redux';

export interface SortProps {
  sortType: SortType;
  ascending: boolean;
}

export enum SortType {
  VoteCount,
  CreatedAt,
  Random,
}

export const _sortProps = (proposals: StoredProposalWithVotes[], props: SortProps) => {
  switch (props.sortType) {
    case SortType.VoteCount:
      return proposals.sort((a, b) =>
        sortHelper(Number(a.voteCount), Number(b.voteCount), props.ascending),
      );
    case SortType.Random:
      return proposals.sort(() => Math.random() - 0.5);
    case SortType.CreatedAt:
      return proposals.sort((a, b) =>
        sortHelper(dayjs(a.createdDate), dayjs(b.createdDate), props.ascending),
      );
    default:
      return proposals.sort((a, b) =>
        sortHelper(dayjs(a.createdDate), dayjs(b.createdDate), props.ascending),
      );
  }
};

export const sortHelper = (a: any, b: any, ascending: boolean) => {
  return ascending ? (a < b ? -1 : 1) : a < b ? 1 : -1;
};

/**
 * Handle sorting of proposals depending on round status
 */
export const dispatchSortProposals = (dispatch: Dispatch, type: number, ascending: boolean) =>
  dispatch(
    sortProposals({
      sortType: type,
      ascending: ascending,
    }),
  );
