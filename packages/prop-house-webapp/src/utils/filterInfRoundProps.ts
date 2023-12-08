import { StoredProposalWithVotes, InfiniteAuction } from '@nouns/prop-house-wrapper/dist/builders';

import dayjs from 'dayjs';
import { InfRoundFilterType } from '../state/slices/propHouse';
import { sortHelper } from './sortHelper';

export const filterInfRoundProps = (
  props: StoredProposalWithVotes[],
  type: InfRoundFilterType,
  round: InfiniteAuction,
) => {
  const now = dayjs();
  switch (type) {
    case InfRoundFilterType.Active:
      return props
        .filter(
          p =>
            p.voteCountFor < round.quorumFor &&
            p.voteCountAgainst < round.quorumAgainst &&
            dayjs(p.createdDate).isAfter(now.subtract(round.votingPeriod, 's')),
        )
        .sort((a, b) => sortHelper(a.voteCountFor, b.voteCountFor, false));
    case InfRoundFilterType.Winners:
      return props
        .filter(p => p.voteCountFor >= round.quorumFor)
        .sort((a, b) => sortHelper(a.createdDate, b.createdDate, false));
    case InfRoundFilterType.Rejected:
      return props
        .filter(p => p.voteCountAgainst >= round.quorumAgainst)
        .sort((a, b) => sortHelper(a.createdDate, b.createdDate, false));
    case InfRoundFilterType.Stale:
      return props
        .filter(
          p =>
            p.voteCountFor < round.quorumFor &&
            dayjs(p.createdDate).isBefore(now.subtract(round.votingPeriod, 's')),
        )
        .sort((a, b) => sortHelper(a.createdDate, b.createdDate, false));
    default:
      return props;
  }
};
