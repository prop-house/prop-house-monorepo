import { StoredProposalWithVotes } from '@nouns/prop-house-wrapper/dist/builders';
import dayjs from 'dayjs';

export interface SortProps {
  sortType: SortType;
  ascending: boolean;
}

export enum SortType {
  Score,
  CreatedAt,
}

export const _sortProps = (
  proposals: StoredProposalWithVotes[],
  props: SortProps
) => {
  return proposals.sort((a, b) =>
    props.sortType === SortType.CreatedAt
      ? sortHelper(dayjs(a.createdDate), dayjs(b.createdDate), props.ascending)
      : sortHelper(a.score, b.score, props.ascending)
  );
};
export const sortHelper = (a: any, b: any, ascending: boolean) => {
  return ascending ? (a < b ? -1 : 1) : a < b ? 1 : -1;
};
