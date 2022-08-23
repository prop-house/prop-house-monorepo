import { gql } from 'graphql-request';

export const roundQuery = (roundEns: string) => gql`
  {
    proposals {
      id
      title
      body
      choices
      start
      end
      snapshot
      state
      author
      space {
        id
        name
      }
    }
  }
`;
