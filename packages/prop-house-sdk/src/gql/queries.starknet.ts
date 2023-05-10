import { graphql } from './starknet';

export const GlobalStatsQuery = graphql(`
  query globalStats {
    summary(id: "SUMMARY") {
      roundCount
      proposalCount
      uniqueProposers
      uniqueVoters
    }
  }
`);

export const ManyProposalsQuery = graphql(`
  query manyProposals(
    $first: Int!
    $skip: Int!
    $orderBy: OrderByProposalFields
    $orderDirection: OrderDirection
    $where: WhereProposal
  ) {
    proposals(
      first: $first
      skip: $skip
      orderBy: $orderBy
      orderDirection: $orderDirection
      where: $where
    ) {
      proposalId
      proposer {
        id
      }
      round {
        sourceChainRound
      }
      metadataUri
      title
      body
      isCancelled
      isWinner
      receivedAt
      txHash
      votingPower
    }
  }
`);

export const ProposalQuery = graphql(`
  query proposal($id: String!) {
    proposal(id: $id) {
      proposalId
      proposer {
        id
      }
      round {
        sourceChainRound
      }
      metadataUri
      title
      body
      isCancelled
      isWinner
      receivedAt
      txHash
      votingPower
    }
  }
`);

// TODO: Add support for nested where clauses
// or add `sourceChainRound` to the Proposal entity
export const ManyRoundProposalsQuery = graphql(`
  query manyRoundProposals($where: WhereRound) {
    rounds(where: $where) {
      proposals {
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
        txHash
        votingPower
      }
    }
  }
`);

export const ManyVotesQuery = graphql(`
  query manyVotes(
    $first: Int!
    $skip: Int!
    $orderBy: OrderByVoteFields
    $orderDirection: OrderDirection
    $where: WhereVote
  ) {
    votes(
      first: $first
      skip: $skip
      orderBy: $orderBy
      orderDirection: $orderDirection
      where: $where
    ) {
      voter {
        id
      }
      round {
        sourceChainRound
      }
      proposal {
        proposalId
      }
      votingPower
      receivedAt
      txHash
    }
  }
`);

export const RoundIdQuery = graphql(`
  query roundId($sourceChainRound: String) {
    rounds(where: { sourceChainRound: $sourceChainRound }) {
      id
    }
  }
`);
