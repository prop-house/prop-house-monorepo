import { gql } from 'graphql-request';

export const houseQuery = (parentENS: string) => gql`
  {
    domains(where: { name: "${parentENS}" }) {
      subdomains {
        name
      }
    }
  }
`;
