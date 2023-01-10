import { StoredProposalWithVotes } from '@nouns/prop-house-wrapper/dist/builders';
import { getLastUpdatedDate } from './getLastUpdatedDate';
import dayjs from 'dayjs';

export const sortByVotesAndHandleTies = (
  proposals: StoredProposalWithVotes[],
  ascending: boolean,
) =>
  proposals.sort((a, b) => {
    if (ascending) {
      if (Number(a.voteCount) > Number(b.voteCount)) {
        return 1;
      } else if (Number(a.voteCount) < Number(b.voteCount)) {
        return -1;
      } else {
        return (dayjs(getLastUpdatedDate(b)) as any) - (dayjs(getLastUpdatedDate(a)) as any);
      }
    } else {
      if (Number(a.voteCount) > Number(b.voteCount)) {
        return -1;
      } else if (Number(a.voteCount) < Number(b.voteCount)) {
        return 1;
      } else {
        return (dayjs(getLastUpdatedDate(a)) as any) - (dayjs(getLastUpdatedDate(b)) as any);
      }
    }
  });
