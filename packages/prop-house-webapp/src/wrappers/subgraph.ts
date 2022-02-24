import { ApolloClient, InMemoryCache, gql } from '@apollo/client';
import { subgraphApiUri } from '../config';

export const delegatedVotesToAddress = (address: string) => gql`
  {
    delegates(where: { id: "${address}" }) {
      delegatedVotesRaw
    }
  }
`;

export const client = new ApolloClient({
  uri: subgraphApiUri,
  cache: new InMemoryCache(),
});
