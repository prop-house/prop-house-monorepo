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
    $where: Proposal_filter
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
      winningPosition
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
      winningPosition
      receivedAt
      txHash
      votingPower
    }
  }
`);

export const ManyVoteVotingPowersQuery = graphql(`
  query manyManyVoteVotingPowers(
    $first: Int!
    $skip: Int!
    $orderBy: OrderByVoteFields
    $orderDirection: OrderDirection
    $where: Vote_filter
  ) {
    votes(
      first: $first
      skip: $skip
      orderBy: $orderBy
      orderDirection: $orderDirection
      where: $where
    ) {
      votingPower
    }
  }
`);

export const ManyVotesQuery = graphql(`
  query manyVotes(
    $first: Int!
    $skip: Int!
    $orderBy: OrderByVoteFields
    $orderDirection: OrderDirection
    $where: Vote_filter
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

export const ManyRoundsWhereProposerOrVoterQuery = graphql(`
  query manyRoundsWhereProposerOrVoter($account: String) {
    proposals(where: { proposer: $account, round_: { state: "ACTIVE" } }) {
      round {
        sourceChainRound
      }
    }
    votes(where: { voter: $account, round_: { state: "ACTIVE" } }, ) {
      round {
        sourceChainRound
      }
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

export const RoundProposalCountQuery = graphql(`
  query roundProposalCount($sourceChainRound: String) {
    rounds(where: { sourceChainRound: $sourceChainRound }) {
      proposalCount
    }
  }
`);

export const RoundMerkleRootQuery = graphql(`
  query roundMerkleRoot($sourceChainRound: String) {
    rounds(where: { sourceChainRound: $sourceChainRound }) {
      merkleRoot
    }
  }
`);
