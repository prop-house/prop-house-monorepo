import { getLastUpdatedDate } from './getLastUpdatedDate';
import dayjs from 'dayjs';
import { Proposal } from '@prophouse/sdk-react';

export const sortByVotesAndHandleTies = (proposals: Proposal[], ascending: boolean) =>
  proposals.sort((a, b) => {
    const gt = a.votingPower > b.votingPower;
    const eq = a.votingPower === b.votingPower;
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
