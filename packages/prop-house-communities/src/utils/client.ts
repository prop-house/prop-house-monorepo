import fetch from 'cross-fetch';
import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client';

export const client = (subgraphUri: string) =>
  new ApolloClient({
    link: new HttpLink({ uri: subgraphUri, fetch }),
    cache: new InMemoryCache(),
  });
