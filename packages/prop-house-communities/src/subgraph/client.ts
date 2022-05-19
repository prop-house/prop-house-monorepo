import fetch from 'cross-fetch';
import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client';
import { nounsSubgraphApiUri } from './uris';

export const client = new ApolloClient({
  link: new HttpLink({ uri: nounsSubgraphApiUri, fetch }),
  cache: new InMemoryCache(),
});
