import { graphql } from './starknet';

export const ManyProposalsForRoundQuery = graphql(`
  query manyProposalsForRound(
    $round: String!
    $first: Int!
    $skip: Int!
    $orderBy: OrderByProposalFields
    $orderDirection: OrderDirection
  ) {
    proposals(
      first: $first
      skip: $skip
      orderBy: $orderBy
      orderDirection: $orderDirection
      where: { round: $round }
    ) {
      id
      proposal_id
      proposer {
        id
      }
      metadata_uri
      title
      body
      is_cancelled
      received_at
      tx
      vote_count
    }
  }
`);
