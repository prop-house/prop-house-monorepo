import { Proposal } from '@prophouse/sdk-react';

export const sortByVotesAndHandleTies = (
  proposals: Proposal[],
  ascending: boolean,
) =>
  proposals.sort((a, b) => {
    const gt = BigInt(a.votingPower) > BigInt(b.votingPower);
    const eq = BigInt(a.votingPower) > BigInt(b.votingPower);
    // Editing is not supported yet
    // const sortedByUpdatedAsc =
    //   (dayjs(getLastUpdatedDate(b)) as any) - (dayjs(getLastUpdatedDate(a)) as any);
    // const sortedByUpdatedDes =
    //   (dayjs(getLastUpdatedDate(a)) as any) - (dayjs(getLastUpdatedDate(b)) as any);

    const sortedByReceivedAsc = b.receivedAt - a.receivedAt;
    const sortedByReceivedDesc = a.receivedAt - b.receivedAt;

    return eq
      ? ascending
        ? sortedByReceivedAsc
        : sortedByReceivedDesc
      : gt
      ? ascending
        ? 1
        : -1
      : ascending
      ? -1
      : 1;
  });
