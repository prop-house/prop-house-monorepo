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
      is_winner
      received_at
      tx
      vote_count
    }
  }
`);

export const ManyProposalsByAccountQuery = graphql(`
  query manyProposalsByAccount(
    $proposer: String!
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
      where: { proposer: $proposer }
    ) {
      id
      proposal_id
      metadata_uri
      title
      body
      is_cancelled
      is_winner
      received_at
      tx
      vote_count
    }
  }
`);

export const ManyVotesByAccountQuery = graphql(`
  query manyVotesByAccount(
    $voter: String!
    $first: Int!
    $skip: Int!
    $orderBy: OrderByVoteFields
    $orderDirection: OrderDirection
  ) {
    votes(
      first: $first
      skip: $skip
      orderBy: $orderBy
      orderDirection: $orderDirection
      where: { voter: $voter }
    ) {
      id
      round {
        id
      }
      proposal {
        id
      }
      voting_power
      received_at
      tx
    }
  }
`);
