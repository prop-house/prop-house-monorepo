import request from 'graphql-request';
import { Provider } from '@ethersproject/abstract-provider';
import { ENSQueryHouseResponse, House } from '../types/';
import { ensSubgraph } from '../subgraphs';
import { houseQuery } from '../queries';
import { textRecordKeys } from '../constants';
import { fetchContentForIpfsTextRecord } from '../utils';

export const fetchHouse = async (ens: string, provider: Provider) => {
  // fetch subdomains for house ens
  const {
    domains: [{ subdomains }],
  }: ENSQueryHouseResponse = await request(ensSubgraph, houseQuery(ens));

  const ensHouseResult = {
    subdomains: subdomains.map(
      (roundSubdomain) => roundSubdomain.name.split(`.${ens}`)[0]
    ),
  };

  try {
    // fetch house ens prophouse text record value
    const meta = await fetchContentForIpfsTextRecord(
      ens,
      provider,
      textRecordKeys.propHouse
    );
    return { ...meta, rounds: ensHouseResult.subdomains } as House;
  } catch (e) {
    throw Error(`Error fetching house hook: ${e}\n`);
  }
};
