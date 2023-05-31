import { StoredProposalWithVotes } from '@nouns/prop-house-wrapper/dist/builders';
import { TimedRoundSortProps, TimedRoundSortType } from '../state/slices/propHouse';
import { sortByVotesAndHandleTies } from './sortByVotesAndHandleTies';
import dayjs from 'dayjs';
import { sortHelper } from './sortHelper';

export const sortTimedRoundProps = (
  proposals: StoredProposalWithVotes[],
  props: TimedRoundSortProps,
) => {
  switch (props.sortType) {
    case TimedRoundSortType.VoteCount:
      return sortByVotesAndHandleTies(proposals, props.ascending);
    case TimedRoundSortType.Random:
      return proposals.sort(() => Math.random() - 0.5);
    case TimedRoundSortType.CreatedAt:
      return proposals.sort((a, b) =>
        sortHelper(dayjs(a.createdDate), dayjs(b.createdDate), props.ascending),
      );
    default:
      return proposals.sort((a, b) =>
        sortHelper(dayjs(a.createdDate), dayjs(b.createdDate), props.ascending),
      );
  }
};
