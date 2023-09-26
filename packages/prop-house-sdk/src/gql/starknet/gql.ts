/* eslint-disable */
import * as types from './graphql';
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';

/**
 * Map of all GraphQL operations in the project.
 *
 * This map has several performance disadvantages:
 * 1. It is not tree-shakeable, so it will include all operations in the project.
 * 2. It is not minifiable, so the string of a GraphQL query will be multiple times inside the bundle.
 * 3. It does not support dead code elimination, so it will add unused operations.
 *
 * Therefore it is highly recommended to use the babel or swc plugin for production.
 */
const documents = {
  '\n  query globalStats {\n    summary(id: "SUMMARY") {\n      roundCount\n      proposalCount\n      uniqueProposers\n      uniqueVoters\n    }\n  }\n':
    types.GlobalStatsDocument,
  '\n  query manyProposals(\n    $first: Int!\n    $skip: Int!\n    $orderBy: OrderByProposalFields\n    $orderDirection: OrderDirection\n    $where: Proposal_filter\n  ) {\n    proposals(\n      first: $first\n      skip: $skip\n      orderBy: $orderBy\n      orderDirection: $orderDirection\n      where: $where\n    ) {\n      proposalId\n      proposer {\n        id\n      }\n      round {\n        sourceChainRound\n      }\n      metadataUri\n      title\n      body\n      isCancelled\n      isWinner\n      receivedAt\n      txHash\n      votingPower\n    }\n  }\n':
    types.ManyProposalsDocument,
  '\n  query proposal($id: String!) {\n    proposal(id: $id) {\n      proposalId\n      proposer {\n        id\n      }\n      round {\n        sourceChainRound\n      }\n      metadataUri\n      title\n      body\n      isCancelled\n      isWinner\n      receivedAt\n      txHash\n      votingPower\n    }\n  }\n':
    types.ProposalDocument,
  '\n  query manyVotes(\n    $first: Int!\n    $skip: Int!\n    $orderBy: OrderByVoteFields\n    $orderDirection: OrderDirection\n    $where: Vote_filter\n  ) {\n    votes(\n      first: $first\n      skip: $skip\n      orderBy: $orderBy\n      orderDirection: $orderDirection\n      where: $where\n    ) {\n      voter {\n        id\n      }\n      round {\n        sourceChainRound\n      }\n      proposal {\n        proposalId\n      }\n      votingPower\n      receivedAt\n      txHash\n    }\n  }\n':
    types.ManyVotesDocument,
  '\n  query roundId($sourceChainRound: String) {\n    rounds(where: { sourceChainRound: $sourceChainRound }) {\n      id\n    }\n  }\n':
    types.RoundIdDocument,
};

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 *
 *
 * @example
 * ```ts
 * const query = graphql(`query GetUser($id: ID!) { user(id: $id) { name } }`);
 * ```
 *
 * The query argument is unknown!
 * Please regenerate the types.
 */
export function graphql(source: string): unknown;

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query globalStats {\n    summary(id: "SUMMARY") {\n      roundCount\n      proposalCount\n      uniqueProposers\n      uniqueVoters\n    }\n  }\n',
): (typeof documents)['\n  query globalStats {\n    summary(id: "SUMMARY") {\n      roundCount\n      proposalCount\n      uniqueProposers\n      uniqueVoters\n    }\n  }\n'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query manyProposals(\n    $first: Int!\n    $skip: Int!\n    $orderBy: OrderByProposalFields\n    $orderDirection: OrderDirection\n    $where: Proposal_filter\n  ) {\n    proposals(\n      first: $first\n      skip: $skip\n      orderBy: $orderBy\n      orderDirection: $orderDirection\n      where: $where\n    ) {\n      proposalId\n      proposer {\n        id\n      }\n      round {\n        sourceChainRound\n      }\n      metadataUri\n      title\n      body\n      isCancelled\n      isWinner\n      receivedAt\n      txHash\n      votingPower\n    }\n  }\n',
): (typeof documents)['\n  query manyProposals(\n    $first: Int!\n    $skip: Int!\n    $orderBy: OrderByProposalFields\n    $orderDirection: OrderDirection\n    $where: Proposal_filter\n  ) {\n    proposals(\n      first: $first\n      skip: $skip\n      orderBy: $orderBy\n      orderDirection: $orderDirection\n      where: $where\n    ) {\n      proposalId\n      proposer {\n        id\n      }\n      round {\n        sourceChainRound\n      }\n      metadataUri\n      title\n      body\n      isCancelled\n      isWinner\n      receivedAt\n      txHash\n      votingPower\n    }\n  }\n'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query proposal($id: String!) {\n    proposal(id: $id) {\n      proposalId\n      proposer {\n        id\n      }\n      round {\n        sourceChainRound\n      }\n      metadataUri\n      title\n      body\n      isCancelled\n      isWinner\n      receivedAt\n      txHash\n      votingPower\n    }\n  }\n',
): (typeof documents)['\n  query proposal($id: String!) {\n    proposal(id: $id) {\n      proposalId\n      proposer {\n        id\n      }\n      round {\n        sourceChainRound\n      }\n      metadataUri\n      title\n      body\n      isCancelled\n      isWinner\n      receivedAt\n      txHash\n      votingPower\n    }\n  }\n'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query manyVotes(\n    $first: Int!\n    $skip: Int!\n    $orderBy: OrderByVoteFields\n    $orderDirection: OrderDirection\n    $where: Vote_filter\n  ) {\n    votes(\n      first: $first\n      skip: $skip\n      orderBy: $orderBy\n      orderDirection: $orderDirection\n      where: $where\n    ) {\n      voter {\n        id\n      }\n      round {\n        sourceChainRound\n      }\n      proposal {\n        proposalId\n      }\n      votingPower\n      receivedAt\n      txHash\n    }\n  }\n',
): (typeof documents)['\n  query manyVotes(\n    $first: Int!\n    $skip: Int!\n    $orderBy: OrderByVoteFields\n    $orderDirection: OrderDirection\n    $where: Vote_filter\n  ) {\n    votes(\n      first: $first\n      skip: $skip\n      orderBy: $orderBy\n      orderDirection: $orderDirection\n      where: $where\n    ) {\n      voter {\n        id\n      }\n      round {\n        sourceChainRound\n      }\n      proposal {\n        proposalId\n      }\n      votingPower\n      receivedAt\n      txHash\n    }\n  }\n'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query roundId($sourceChainRound: String) {\n    rounds(where: { sourceChainRound: $sourceChainRound }) {\n      id\n    }\n  }\n',
): (typeof documents)['\n  query roundId($sourceChainRound: String) {\n    rounds(where: { sourceChainRound: $sourceChainRound }) {\n      id\n    }\n  }\n'];

export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> =
  TDocumentNode extends DocumentNode<infer TType, any> ? TType : never;
