import { TimedRoundSortProps, TimedRoundSortType } from '../state/slices/propHouse';
import { sortByVotesAndHandleTies } from './sortByVotesAndHandleTies';
import dayjs from 'dayjs';
import { sortHelper } from './sortHelper';
import { ProposalWithTldr } from '../types/ProposalWithTldr';

export const sortTimedRoundProps = (
  proposals: ProposalWithTldr[],
  props: TimedRoundSortProps,
): ProposalWithTldr[] => {
  switch (props.sortType) {
    case TimedRoundSortType.VoteCount:
      return sortByVotesAndHandleTies(proposals, props.ascending);
    case TimedRoundSortType.Random:
      return proposals.sort(() => Math.random() - 0.5);
    case TimedRoundSortType.CreatedAt:
      return proposals.sort((a, b) =>
        sortHelper(dayjs(a.receivedAt), dayjs(b.receivedAt), props.ascending),
      );
    default:
      return proposals.sort((a, b) =>
        sortHelper(dayjs(a.receivedAt), dayjs(b.receivedAt), props.ascending),
      );
  }
};
