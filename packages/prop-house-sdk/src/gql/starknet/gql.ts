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
  '\n  query globalStats {\n    summary(id: "SUMMARY") {\n      roundCount\n      proposalCount\n      voteSubmissionCount\n    }\n  }\n':
    types.GlobalStatsDocument,
  '\n  query manyProposalsForRound(\n    $round: String!\n    $first: Int!\n    $skip: Int!\n    $orderBy: OrderByProposalFields\n    $orderDirection: OrderDirection\n  ) {\n    proposals(\n      first: $first\n      skip: $skip\n      orderBy: $orderBy\n      orderDirection: $orderDirection\n      where: { round: $round }\n    ) {\n      id\n      proposalId\n      proposer {\n        id\n      }\n      metadataUri\n      title\n      body\n      isCancelled\n      isWinner\n      receivedAt\n      tx\n      voteCount\n    }\n  }\n':
    types.ManyProposalsForRoundDocument,
  '\n  query manyProposalsByAccount(\n    $proposer: String!\n    $first: Int!\n    $skip: Int!\n    $orderBy: OrderByProposalFields\n    $orderDirection: OrderDirection\n  ) {\n    proposals(\n      first: $first\n      skip: $skip\n      orderBy: $orderBy\n      orderDirection: $orderDirection\n      where: { proposer: $proposer }\n    ) {\n      id\n      proposalId\n      metadataUri\n      title\n      body\n      isCancelled\n      isWinner\n      receivedAt\n      tx\n      voteCount\n    }\n  }\n':
    types.ManyProposalsByAccountDocument,
  '\n  query manyVotesByAccount(\n    $voter: String!\n    $first: Int!\n    $skip: Int!\n    $orderBy: OrderByVoteFields\n    $orderDirection: OrderDirection\n  ) {\n    votes(\n      first: $first\n      skip: $skip\n      orderBy: $orderBy\n      orderDirection: $orderDirection\n      where: { voter: $voter }\n    ) {\n      id\n      round {\n        id\n      }\n      proposal {\n        id\n      }\n      votingPower\n      receivedAt\n      tx\n    }\n  }\n':
    types.ManyVotesByAccountDocument,
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
  source: '\n  query globalStats {\n    summary(id: "SUMMARY") {\n      roundCount\n      proposalCount\n      voteSubmissionCount\n    }\n  }\n',
): (typeof documents)['\n  query globalStats {\n    summary(id: "SUMMARY") {\n      roundCount\n      proposalCount\n      voteSubmissionCount\n    }\n  }\n'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query manyProposalsForRound(\n    $round: String!\n    $first: Int!\n    $skip: Int!\n    $orderBy: OrderByProposalFields\n    $orderDirection: OrderDirection\n  ) {\n    proposals(\n      first: $first\n      skip: $skip\n      orderBy: $orderBy\n      orderDirection: $orderDirection\n      where: { round: $round }\n    ) {\n      id\n      proposalId\n      proposer {\n        id\n      }\n      metadataUri\n      title\n      body\n      isCancelled\n      isWinner\n      receivedAt\n      tx\n      voteCount\n    }\n  }\n',
): (typeof documents)['\n  query manyProposalsForRound(\n    $round: String!\n    $first: Int!\n    $skip: Int!\n    $orderBy: OrderByProposalFields\n    $orderDirection: OrderDirection\n  ) {\n    proposals(\n      first: $first\n      skip: $skip\n      orderBy: $orderBy\n      orderDirection: $orderDirection\n      where: { round: $round }\n    ) {\n      id\n      proposalId\n      proposer {\n        id\n      }\n      metadataUri\n      title\n      body\n      isCancelled\n      isWinner\n      receivedAt\n      tx\n      voteCount\n    }\n  }\n'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query manyProposalsByAccount(\n    $proposer: String!\n    $first: Int!\n    $skip: Int!\n    $orderBy: OrderByProposalFields\n    $orderDirection: OrderDirection\n  ) {\n    proposals(\n      first: $first\n      skip: $skip\n      orderBy: $orderBy\n      orderDirection: $orderDirection\n      where: { proposer: $proposer }\n    ) {\n      id\n      proposalId\n      metadataUri\n      title\n      body\n      isCancelled\n      isWinner\n      receivedAt\n      tx\n      voteCount\n    }\n  }\n',
): (typeof documents)['\n  query manyProposalsByAccount(\n    $proposer: String!\n    $first: Int!\n    $skip: Int!\n    $orderBy: OrderByProposalFields\n    $orderDirection: OrderDirection\n  ) {\n    proposals(\n      first: $first\n      skip: $skip\n      orderBy: $orderBy\n      orderDirection: $orderDirection\n      where: { proposer: $proposer }\n    ) {\n      id\n      proposalId\n      metadataUri\n      title\n      body\n      isCancelled\n      isWinner\n      receivedAt\n      tx\n      voteCount\n    }\n  }\n'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query manyVotesByAccount(\n    $voter: String!\n    $first: Int!\n    $skip: Int!\n    $orderBy: OrderByVoteFields\n    $orderDirection: OrderDirection\n  ) {\n    votes(\n      first: $first\n      skip: $skip\n      orderBy: $orderBy\n      orderDirection: $orderDirection\n      where: { voter: $voter }\n    ) {\n      id\n      round {\n        id\n      }\n      proposal {\n        id\n      }\n      votingPower\n      receivedAt\n      tx\n    }\n  }\n',
): (typeof documents)['\n  query manyVotesByAccount(\n    $voter: String!\n    $first: Int!\n    $skip: Int!\n    $orderBy: OrderByVoteFields\n    $orderDirection: OrderDirection\n  ) {\n    votes(\n      first: $first\n      skip: $skip\n      orderBy: $orderBy\n      orderDirection: $orderDirection\n      where: { voter: $voter }\n    ) {\n      id\n      round {\n        id\n      }\n      proposal {\n        id\n      }\n      votingPower\n      receivedAt\n      tx\n    }\n  }\n'];

export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> =
  TDocumentNode extends DocumentNode<infer TType, any> ? TType : never;
