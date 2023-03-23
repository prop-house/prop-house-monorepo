import { StoredProposalWithVotes } from '@nouns/prop-house-wrapper/dist/builders';
import { getLastUpdatedDate } from './getLastUpdatedDate';
import dayjs from 'dayjs';

export const sortByVotesAndHandleTies = (
  proposals: StoredProposalWithVotes[],
  ascending: boolean,
) =>
  proposals.sort((a, b) => {
    const gt = a.voteCount > b.voteCount;
    const eq = a.voteCount === b.voteCount;
    const sortedByUpdatedAsc =
      (dayjs(getLastUpdatedDate(b)) as any) - (dayjs(getLastUpdatedDate(a)) as any);
    const sortedByUpdatedDes =
      (dayjs(getLastUpdatedDate(a)) as any) - (dayjs(getLastUpdatedDate(b)) as any);

    return eq
      ? ascending
        ? sortedByUpdatedAsc
        : sortedByUpdatedDes
      : gt
      ? ascending
        ? 1
        : -1
      : ascending
      ? -1
      : 1;
  });
