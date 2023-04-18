import { graphql } from './starknet';

export const GlobalStatsQuery = graphql(`
  query globalStats {
    summary(id: "SUMMARY") {
      roundCount
      proposalCount
      voteSubmissionCount
    }
  }
`);

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
      proposalId
      proposer {
        id
      }
      metadataUri
      title
      body
      isCancelled
      isWinner
      receivedAt
      tx
      voteCount
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
      proposalId
      metadataUri
      title
      body
      isCancelled
      isWinner
      receivedAt
      tx
      voteCount
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
      votingPower
      receivedAt
      tx
    }
  }
`);
