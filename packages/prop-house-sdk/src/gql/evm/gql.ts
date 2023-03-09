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
  '\n  fragment TimedFundingRoundConfigParts on TimedFundingRoundConfig {\n    winnerCount\n    proposalPeriodStartTimestamp\n    proposalPeriodDuration\n    votePeriodStartTimestamp\n    votePeriodDuration\n    votingStrategies {\n      id\n      type\n      address\n      params\n    }\n    awards {\n      asset {\n        assetType\n        token\n        identifier\n      }\n      amount\n    }\n  }\n':
    types.TimedFundingRoundConfigPartsFragmentDoc,
  '\n  query manyHousesSimple(\n    $first: Int!\n    $skip: Int!\n    $orderBy: House_orderBy\n    $orderDirection: OrderDirection\n  ) {\n    houses(first: $first, skip: $skip, orderBy: $orderBy, orderDirection: $orderDirection) {\n      id\n      name\n      description\n      imageURI\n      createdAt\n    }\n  }\n':
    types.ManyHousesSimpleDocument,
  '\n  query manyHousesSimpleWhereAccountHasCreatorPermissions(\n    $creator: String!\n    $first: Int!\n    $skip: Int!\n    $orderBy: Round_orderBy\n    $orderDirection: OrderDirection\n  ) {\n    houses(where: { roundCreators_: { creator: $creator } }) {\n      id\n      name\n      description\n      imageURI\n      createdAt\n    }\n  }\n':
    types.ManyHousesSimpleWhereAccountHasCreatorPermissionsDocument,
  '\n  query manyHousesSimpleWhereAccountIsOwner(\n    $owner: String!\n    $first: Int!\n    $skip: Int!\n    $orderBy: Round_orderBy\n    $orderDirection: OrderDirection\n  ) {\n    houses(where: { owner: $owner }) {\n      id\n      name\n      description\n      imageURI\n      createdAt\n    }\n  }\n':
    types.ManyHousesSimpleWhereAccountIsOwnerDocument,
  '\n  query manyRoundsSimple(\n    $first: Int!\n    $skip: Int!\n    $orderBy: Round_orderBy\n    $orderDirection: OrderDirection\n  ) {\n    rounds(first: $first, skip: $skip, orderBy: $orderBy, orderDirection: $orderDirection) {\n      id\n      type\n      title\n      description\n      createdAt\n      state\n    }\n  }\n':
    types.ManyRoundsSimpleDocument,
  '\n  query manyRoundsSimpleForHouse(\n    $house: String!\n    $first: Int!\n    $skip: Int!\n    $orderBy: Round_orderBy\n    $orderDirection: OrderDirection\n  ) {\n    rounds(\n      first: $first\n      skip: $skip\n      orderBy: $orderBy\n      orderDirection: $orderDirection\n      where: { house: $house }\n    ) {\n      id\n      type\n      title\n      description\n      createdAt\n      state\n    }\n  }\n':
    types.ManyRoundsSimpleForHouseDocument,
  '\n  query manyRoundsSimpleWhereTitleContains(\n    $titleContains: String!\n    $first: Int!\n    $skip: Int!\n    $orderBy: Round_orderBy\n    $orderDirection: OrderDirection\n  ) {\n    rounds(\n      first: $first\n      skip: $skip\n      orderBy: $orderBy\n      orderDirection: $orderDirection\n      where: { title_contains_nocase: $titleContains }\n    ) {\n      id\n      type\n      title\n      description\n      createdAt\n      state\n    }\n  }\n':
    types.ManyRoundsSimpleWhereTitleContainsDocument,
  '\n  query round($id: ID!) {\n    round(id: $id) {\n      id\n      type\n      title\n      description\n      createdAt\n      state\n      manager {\n        id\n      }\n      timedFundingConfig {\n        ...TimedFundingRoundConfigParts\n      }\n    }\n  }\n':
    types.RoundDocument,
  '\n  query manyRoundBalances(\n    $round: String!\n    $first: Int!\n    $skip: Int!\n    $orderBy: Balance_orderBy\n    $orderDirection: OrderDirection\n  ) {\n    balances(\n      first: $first\n      skip: $skip\n      orderBy: $orderBy\n      orderDirection: $orderDirection\n      where: { round: $round }\n    ) {\n      id\n      asset {\n        assetType\n        token\n        identifier\n      }\n      balance\n      updatedAt\n    }\n  }\n':
    types.ManyRoundBalancesDocument,
  '\n  query manyRoundsSimpleManagedByAccount(\n    $manager: String!\n    $first: Int!\n    $skip: Int!\n    $orderBy: Round_orderBy\n    $orderDirection: OrderDirection\n  ) {\n    rounds(\n      first: $first\n      skip: $skip\n      orderBy: $orderBy\n      orderDirection: $orderDirection\n      where: { manager: $manager }\n    ) {\n      id\n      type\n      title\n      description\n      createdAt\n      state\n    }\n  }\n':
    types.ManyRoundsSimpleManagedByAccountDocument,
  '\n  query manyDepositsByAccount(\n    $depositor: String!\n    $first: Int!\n    $skip: Int!\n    $orderBy: Deposit_orderBy\n    $orderDirection: OrderDirection\n  ) {\n    deposits(\n      first: $first\n      skip: $skip\n      orderBy: $orderBy\n      orderDirection: $orderDirection\n      where: { depositor: $depositor }\n    ) {\n      id\n      depositedAt\n      asset {\n        assetType\n        token\n        identifier\n      }\n      amount\n      round {\n        id\n      }\n    }\n  }\n':
    types.ManyDepositsByAccountDocument,
  '\n  query manyClaimsByAccount(\n    $claimer: String!\n    $first: Int!\n    $skip: Int!\n    $orderBy: Claim_orderBy\n    $orderDirection: OrderDirection\n  ) {\n    claims(\n      first: $first\n      skip: $skip\n      orderBy: $orderBy\n      orderDirection: $orderDirection\n      where: { claimer: $claimer }\n    ) {\n      id\n      claimedAt\n      recipient\n      proposalId\n      round {\n        id\n      }\n      asset {\n        assetType\n        token\n        identifier\n      }\n      amount\n    }\n  }\n':
    types.ManyClaimsByAccountDocument,
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
  source: '\n  fragment TimedFundingRoundConfigParts on TimedFundingRoundConfig {\n    winnerCount\n    proposalPeriodStartTimestamp\n    proposalPeriodDuration\n    votePeriodStartTimestamp\n    votePeriodDuration\n    votingStrategies {\n      id\n      type\n      address\n      params\n    }\n    awards {\n      asset {\n        assetType\n        token\n        identifier\n      }\n      amount\n    }\n  }\n',
): typeof documents['\n  fragment TimedFundingRoundConfigParts on TimedFundingRoundConfig {\n    winnerCount\n    proposalPeriodStartTimestamp\n    proposalPeriodDuration\n    votePeriodStartTimestamp\n    votePeriodDuration\n    votingStrategies {\n      id\n      type\n      address\n      params\n    }\n    awards {\n      asset {\n        assetType\n        token\n        identifier\n      }\n      amount\n    }\n  }\n'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query manyHousesSimple(\n    $first: Int!\n    $skip: Int!\n    $orderBy: House_orderBy\n    $orderDirection: OrderDirection\n  ) {\n    houses(first: $first, skip: $skip, orderBy: $orderBy, orderDirection: $orderDirection) {\n      id\n      name\n      description\n      imageURI\n      createdAt\n    }\n  }\n',
): typeof documents['\n  query manyHousesSimple(\n    $first: Int!\n    $skip: Int!\n    $orderBy: House_orderBy\n    $orderDirection: OrderDirection\n  ) {\n    houses(first: $first, skip: $skip, orderBy: $orderBy, orderDirection: $orderDirection) {\n      id\n      name\n      description\n      imageURI\n      createdAt\n    }\n  }\n'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query manyHousesSimpleWhereAccountHasCreatorPermissions(\n    $creator: String!\n    $first: Int!\n    $skip: Int!\n    $orderBy: Round_orderBy\n    $orderDirection: OrderDirection\n  ) {\n    houses(where: { roundCreators_: { creator: $creator } }) {\n      id\n      name\n      description\n      imageURI\n      createdAt\n    }\n  }\n',
): typeof documents['\n  query manyHousesSimpleWhereAccountHasCreatorPermissions(\n    $creator: String!\n    $first: Int!\n    $skip: Int!\n    $orderBy: Round_orderBy\n    $orderDirection: OrderDirection\n  ) {\n    houses(where: { roundCreators_: { creator: $creator } }) {\n      id\n      name\n      description\n      imageURI\n      createdAt\n    }\n  }\n'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query manyHousesSimpleWhereAccountIsOwner(\n    $owner: String!\n    $first: Int!\n    $skip: Int!\n    $orderBy: Round_orderBy\n    $orderDirection: OrderDirection\n  ) {\n    houses(where: { owner: $owner }) {\n      id\n      name\n      description\n      imageURI\n      createdAt\n    }\n  }\n',
): typeof documents['\n  query manyHousesSimpleWhereAccountIsOwner(\n    $owner: String!\n    $first: Int!\n    $skip: Int!\n    $orderBy: Round_orderBy\n    $orderDirection: OrderDirection\n  ) {\n    houses(where: { owner: $owner }) {\n      id\n      name\n      description\n      imageURI\n      createdAt\n    }\n  }\n'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query manyRoundsSimple(\n    $first: Int!\n    $skip: Int!\n    $orderBy: Round_orderBy\n    $orderDirection: OrderDirection\n  ) {\n    rounds(first: $first, skip: $skip, orderBy: $orderBy, orderDirection: $orderDirection) {\n      id\n      type\n      title\n      description\n      createdAt\n      state\n    }\n  }\n',
): typeof documents['\n  query manyRoundsSimple(\n    $first: Int!\n    $skip: Int!\n    $orderBy: Round_orderBy\n    $orderDirection: OrderDirection\n  ) {\n    rounds(first: $first, skip: $skip, orderBy: $orderBy, orderDirection: $orderDirection) {\n      id\n      type\n      title\n      description\n      createdAt\n      state\n    }\n  }\n'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query manyRoundsSimpleForHouse(\n    $house: String!\n    $first: Int!\n    $skip: Int!\n    $orderBy: Round_orderBy\n    $orderDirection: OrderDirection\n  ) {\n    rounds(\n      first: $first\n      skip: $skip\n      orderBy: $orderBy\n      orderDirection: $orderDirection\n      where: { house: $house }\n    ) {\n      id\n      type\n      title\n      description\n      createdAt\n      state\n    }\n  }\n',
): typeof documents['\n  query manyRoundsSimpleForHouse(\n    $house: String!\n    $first: Int!\n    $skip: Int!\n    $orderBy: Round_orderBy\n    $orderDirection: OrderDirection\n  ) {\n    rounds(\n      first: $first\n      skip: $skip\n      orderBy: $orderBy\n      orderDirection: $orderDirection\n      where: { house: $house }\n    ) {\n      id\n      type\n      title\n      description\n      createdAt\n      state\n    }\n  }\n'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query manyRoundsSimpleWhereTitleContains(\n    $titleContains: String!\n    $first: Int!\n    $skip: Int!\n    $orderBy: Round_orderBy\n    $orderDirection: OrderDirection\n  ) {\n    rounds(\n      first: $first\n      skip: $skip\n      orderBy: $orderBy\n      orderDirection: $orderDirection\n      where: { title_contains_nocase: $titleContains }\n    ) {\n      id\n      type\n      title\n      description\n      createdAt\n      state\n    }\n  }\n',
): typeof documents['\n  query manyRoundsSimpleWhereTitleContains(\n    $titleContains: String!\n    $first: Int!\n    $skip: Int!\n    $orderBy: Round_orderBy\n    $orderDirection: OrderDirection\n  ) {\n    rounds(\n      first: $first\n      skip: $skip\n      orderBy: $orderBy\n      orderDirection: $orderDirection\n      where: { title_contains_nocase: $titleContains }\n    ) {\n      id\n      type\n      title\n      description\n      createdAt\n      state\n    }\n  }\n'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query round($id: ID!) {\n    round(id: $id) {\n      id\n      type\n      title\n      description\n      createdAt\n      state\n      manager {\n        id\n      }\n      timedFundingConfig {\n        ...TimedFundingRoundConfigParts\n      }\n    }\n  }\n',
): typeof documents['\n  query round($id: ID!) {\n    round(id: $id) {\n      id\n      type\n      title\n      description\n      createdAt\n      state\n      manager {\n        id\n      }\n      timedFundingConfig {\n        ...TimedFundingRoundConfigParts\n      }\n    }\n  }\n'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query manyRoundBalances(\n    $round: String!\n    $first: Int!\n    $skip: Int!\n    $orderBy: Balance_orderBy\n    $orderDirection: OrderDirection\n  ) {\n    balances(\n      first: $first\n      skip: $skip\n      orderBy: $orderBy\n      orderDirection: $orderDirection\n      where: { round: $round }\n    ) {\n      id\n      asset {\n        assetType\n        token\n        identifier\n      }\n      balance\n      updatedAt\n    }\n  }\n',
): typeof documents['\n  query manyRoundBalances(\n    $round: String!\n    $first: Int!\n    $skip: Int!\n    $orderBy: Balance_orderBy\n    $orderDirection: OrderDirection\n  ) {\n    balances(\n      first: $first\n      skip: $skip\n      orderBy: $orderBy\n      orderDirection: $orderDirection\n      where: { round: $round }\n    ) {\n      id\n      asset {\n        assetType\n        token\n        identifier\n      }\n      balance\n      updatedAt\n    }\n  }\n'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query manyRoundsSimpleManagedByAccount(\n    $manager: String!\n    $first: Int!\n    $skip: Int!\n    $orderBy: Round_orderBy\n    $orderDirection: OrderDirection\n  ) {\n    rounds(\n      first: $first\n      skip: $skip\n      orderBy: $orderBy\n      orderDirection: $orderDirection\n      where: { manager: $manager }\n    ) {\n      id\n      type\n      title\n      description\n      createdAt\n      state\n    }\n  }\n',
): typeof documents['\n  query manyRoundsSimpleManagedByAccount(\n    $manager: String!\n    $first: Int!\n    $skip: Int!\n    $orderBy: Round_orderBy\n    $orderDirection: OrderDirection\n  ) {\n    rounds(\n      first: $first\n      skip: $skip\n      orderBy: $orderBy\n      orderDirection: $orderDirection\n      where: { manager: $manager }\n    ) {\n      id\n      type\n      title\n      description\n      createdAt\n      state\n    }\n  }\n'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query manyDepositsByAccount(\n    $depositor: String!\n    $first: Int!\n    $skip: Int!\n    $orderBy: Deposit_orderBy\n    $orderDirection: OrderDirection\n  ) {\n    deposits(\n      first: $first\n      skip: $skip\n      orderBy: $orderBy\n      orderDirection: $orderDirection\n      where: { depositor: $depositor }\n    ) {\n      id\n      depositedAt\n      asset {\n        assetType\n        token\n        identifier\n      }\n      amount\n      round {\n        id\n      }\n    }\n  }\n',
): typeof documents['\n  query manyDepositsByAccount(\n    $depositor: String!\n    $first: Int!\n    $skip: Int!\n    $orderBy: Deposit_orderBy\n    $orderDirection: OrderDirection\n  ) {\n    deposits(\n      first: $first\n      skip: $skip\n      orderBy: $orderBy\n      orderDirection: $orderDirection\n      where: { depositor: $depositor }\n    ) {\n      id\n      depositedAt\n      asset {\n        assetType\n        token\n        identifier\n      }\n      amount\n      round {\n        id\n      }\n    }\n  }\n'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query manyClaimsByAccount(\n    $claimer: String!\n    $first: Int!\n    $skip: Int!\n    $orderBy: Claim_orderBy\n    $orderDirection: OrderDirection\n  ) {\n    claims(\n      first: $first\n      skip: $skip\n      orderBy: $orderBy\n      orderDirection: $orderDirection\n      where: { claimer: $claimer }\n    ) {\n      id\n      claimedAt\n      recipient\n      proposalId\n      round {\n        id\n      }\n      asset {\n        assetType\n        token\n        identifier\n      }\n      amount\n    }\n  }\n',
): typeof documents['\n  query manyClaimsByAccount(\n    $claimer: String!\n    $first: Int!\n    $skip: Int!\n    $orderBy: Claim_orderBy\n    $orderDirection: OrderDirection\n  ) {\n    claims(\n      first: $first\n      skip: $skip\n      orderBy: $orderBy\n      orderDirection: $orderDirection\n      where: { claimer: $claimer }\n    ) {\n      id\n      claimedAt\n      recipient\n      proposalId\n      round {\n        id\n      }\n      asset {\n        assetType\n        token\n        identifier\n      }\n      amount\n    }\n  }\n'];

export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<
  TDocumentNode extends DocumentNode<any, any>
> = TDocumentNode extends DocumentNode<infer TType, any> ? TType : never;
