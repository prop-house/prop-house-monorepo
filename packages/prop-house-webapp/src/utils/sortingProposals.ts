import {
  StoredAuction,
  StoredProposalWithVotes,
} from '@nouns/prop-house-wrapper/dist/builders';
import dayjs from 'dayjs';
import { sortProposals } from '../state/slices/propHouse';
import { auctionStatus, AuctionStatus } from './auctionStatus';
import { Dispatch } from 'redux';

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
      : sortHelper(Number(a.score), Number(b.score), props.ascending)
  );
};
export const sortHelper = (a: any, b: any, ascending: boolean) => {
  return ascending ? (a < b ? -1 : 1) : a < b ? 1 : -1;
};

/**
 * Handle sorting of proposals depending on round status
 */
export const dispatchSortProposals = (
  dispatch: Dispatch,
  auction: StoredAuction,
  ascending: boolean
) =>
  dispatch(
    sortProposals({
      sortType:
        auctionStatus(auction) === AuctionStatus.AuctionEnded
          ? SortType.Score
          : SortType.CreatedAt,
      ascending: ascending,
    })
  );
