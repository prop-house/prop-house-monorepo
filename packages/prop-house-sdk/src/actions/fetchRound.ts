import request from 'graphql-request';
import { Provider } from '@ethersproject/providers';

import { fetchContentForIpfsTextRecord } from '../utils/fetchContentForIpfsTextRecord';
import { Round } from '../types/Round';
import { roundQuery } from '../queries/roundQuery';
import { snapshotSubgraph } from '../subgraphs/snapshot';
import { ENSQueryRoundResponse } from '../types/ENSQueryRoundResponse';
import { textRecordKeys } from '../constants';

export const fetchRound = async (ens: string, provider: Provider) => {
  try {
    const { proposals }: ENSQueryRoundResponse = await request(snapshotSubgraph, roundQuery(ens));

    // fetch snapshot text record value
    const meta = await fetchContentForIpfsTextRecord(ens, provider, textRecordKeys.snapshot);
    return { ...meta, proposals } as any;
  } catch (e) {
    throw Error(`Error fetching round ${ens}, error: ${e}`);
  }
};
