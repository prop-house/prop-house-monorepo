import fetch from 'cross-fetch';
import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client';
import { subgraphApiUri } from '../config';

export const delegatedVotesToAddressQuery = (address: string) => `
  {
    delegates(where: { id: "${address}" }) {
      delegatedVotesRaw
    }
  }
`;

export const client = new ApolloClient({
  link: new HttpLink({ uri: subgraphApiUri, fetch }),
  cache: new InMemoryCache(),
});
