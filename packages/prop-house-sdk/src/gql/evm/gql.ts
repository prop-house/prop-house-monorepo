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
  '\n  fragment HouseFields on House {\n    id\n    metadata {\n      name\n      description\n      imageURI\n    }\n    createdAt\n    roundCount\n    owner {\n      id\n    }\n    roundCreators {\n      creator {\n        id\n      }\n      passCount\n    }\n  }\n':
    types.HouseFieldsFragmentDoc,
  '\n  fragment GovPowerStrategyFields on GovPowerStrategy {\n    id\n    type\n    address\n    params\n  }\n':
    types.GovPowerStrategyFieldsFragmentDoc,
  '\n  fragment TimedFundingRoundConfigFields on TimedFundingRoundConfig {\n    winnerCount\n    proposalThreshold\n    proposalPeriodStartTimestamp\n    proposalPeriodEndTimestamp\n    proposalPeriodDuration\n    votePeriodStartTimestamp\n    votePeriodEndTimestamp\n    votePeriodDuration\n    claimPeriodEndTimestamp\n    awards {\n      asset {\n        assetType\n        token\n        identifier\n      }\n      amount\n    }\n  }\n':
    types.TimedFundingRoundConfigFieldsFragmentDoc,
  '\n  fragment RoundFields on Round {\n    id\n    type\n    title\n    description\n    createdAt\n    eventState\n    manager {\n      id\n    }\n    proposingStrategies {\n      strategy {\n        ...GovPowerStrategyFields\n      }\n    }\n    votingStrategies {\n      strategy {\n        ...GovPowerStrategyFields\n      }\n    }\n    timedFundingConfig {\n      ...TimedFundingRoundConfigFields\n    }\n  }\n':
    types.RoundFieldsFragmentDoc,
  '\n  query manyHouses(\n    $first: Int!\n    $skip: Int!\n    $orderBy: House_orderBy\n    $orderDirection: OrderDirection\n    $where: House_filter\n  ) {\n    houses(\n      first: $first\n      skip: $skip\n      orderBy: $orderBy\n      orderDirection: $orderDirection\n      where: $where\n    ) {\n      ...HouseFields\n    }\n  }\n':
    types.ManyHousesDocument,
  '\n  query house($id: ID!) {\n    house(id: $id) {\n      ...HouseFields\n    }\n  }\n':
    types.HouseDocument,
  '\n  query manyRounds(\n    $first: Int!\n    $skip: Int!\n    $orderBy: Round_orderBy\n    $orderDirection: OrderDirection\n    $where: Round_filter\n  ) {\n    rounds(\n      first: $first\n      skip: $skip\n      orderBy: $orderBy\n      orderDirection: $orderDirection\n      where: $where\n    ) {\n      ...RoundFields\n    }\n  }\n':
    types.ManyRoundsDocument,
  '\n  query manyRoundsWithHouseInfo(\n    $first: Int!\n    $skip: Int!\n    $orderBy: Round_orderBy\n    $orderDirection: OrderDirection\n    $where: Round_filter\n  ) {\n    rounds(\n      first: $first\n      skip: $skip\n      orderBy: $orderBy\n      orderDirection: $orderDirection\n      where: $where\n    ) {\n      ...RoundFields\n      house {\n        ...HouseFields\n      }\n    }\n  }\n':
    types.ManyRoundsWithHouseInfoDocument,
  '\n  query round($id: ID!) {\n    round(id: $id) {\n      ...RoundFields\n    }\n  }\n':
    types.RoundDocument,
  '\n  query roundWithHouseInfo($id: ID!) {\n    round(id: $id) {\n      ...RoundFields\n      house {\n        ...HouseFields\n      }\n    }\n  }\n':
    types.RoundWithHouseInfoDocument,
  '\n  query manyBalances(\n    $first: Int!\n    $skip: Int!\n    $orderBy: Balance_orderBy\n    $orderDirection: OrderDirection\n    $where: Balance_filter\n  ) {\n    balances(\n      first: $first\n      skip: $skip\n      orderBy: $orderBy\n      orderDirection: $orderDirection\n      where: $where\n    ) {\n      id\n      asset {\n        assetType\n        token\n        identifier\n      }\n      balance\n      updatedAt\n    }\n  }\n':
    types.ManyBalancesDocument,
  '\n  query manyGovPowerStrategies(\n    $first: Int!\n    $skip: Int!\n    $orderBy: GovPowerStrategy_orderBy\n    $orderDirection: OrderDirection\n    $where: GovPowerStrategy_filter\n  ) {\n    govPowerStrategies(\n      first: $first\n      skip: $skip\n      orderBy: $orderBy\n      orderDirection: $orderDirection\n      where: $where\n    ) {\n      ...GovPowerStrategyFields\n    }\n  }\n':
    types.ManyGovPowerStrategiesDocument,
  '\n  query manyDeposits(\n    $first: Int!\n    $skip: Int!\n    $orderBy: Deposit_orderBy\n    $orderDirection: OrderDirection\n    $where: Deposit_filter\n  ) {\n    deposits(\n      first: $first\n      skip: $skip\n      orderBy: $orderBy\n      orderDirection: $orderDirection\n      where: $where\n    ) {\n      id\n      depositedAt\n      asset {\n        assetType\n        token\n        identifier\n      }\n      amount\n      round {\n        id\n      }\n    }\n  }\n':
    types.ManyDepositsDocument,
  '\n  query manyClaims(\n    $first: Int!\n    $skip: Int!\n    $orderBy: Claim_orderBy\n    $orderDirection: OrderDirection\n    $where: Claim_filter\n  ) {\n    claims(\n      first: $first\n      skip: $skip\n      orderBy: $orderBy\n      orderDirection: $orderDirection\n      where: $where\n    ) {\n      id\n      claimedAt\n      recipient\n      proposalId\n      round {\n        id\n      }\n      asset {\n        assetType\n        token\n        identifier\n      }\n      amount\n    }\n  }\n':
    types.ManyClaimsDocument,
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
  source: '\n  fragment HouseFields on House {\n    id\n    metadata {\n      name\n      description\n      imageURI\n    }\n    createdAt\n    roundCount\n    owner {\n      id\n    }\n    roundCreators {\n      creator {\n        id\n      }\n      passCount\n    }\n  }\n',
): (typeof documents)['\n  fragment HouseFields on House {\n    id\n    metadata {\n      name\n      description\n      imageURI\n    }\n    createdAt\n    roundCount\n    owner {\n      id\n    }\n    roundCreators {\n      creator {\n        id\n      }\n      passCount\n    }\n  }\n'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  fragment GovPowerStrategyFields on GovPowerStrategy {\n    id\n    type\n    address\n    params\n  }\n',
): (typeof documents)['\n  fragment GovPowerStrategyFields on GovPowerStrategy {\n    id\n    type\n    address\n    params\n  }\n'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  fragment TimedFundingRoundConfigFields on TimedFundingRoundConfig {\n    winnerCount\n    proposalThreshold\n    proposalPeriodStartTimestamp\n    proposalPeriodEndTimestamp\n    proposalPeriodDuration\n    votePeriodStartTimestamp\n    votePeriodEndTimestamp\n    votePeriodDuration\n    claimPeriodEndTimestamp\n    awards {\n      asset {\n        assetType\n        token\n        identifier\n      }\n      amount\n    }\n  }\n',
): (typeof documents)['\n  fragment TimedFundingRoundConfigFields on TimedFundingRoundConfig {\n    winnerCount\n    proposalThreshold\n    proposalPeriodStartTimestamp\n    proposalPeriodEndTimestamp\n    proposalPeriodDuration\n    votePeriodStartTimestamp\n    votePeriodEndTimestamp\n    votePeriodDuration\n    claimPeriodEndTimestamp\n    awards {\n      asset {\n        assetType\n        token\n        identifier\n      }\n      amount\n    }\n  }\n'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  fragment RoundFields on Round {\n    id\n    type\n    title\n    description\n    createdAt\n    eventState\n    manager {\n      id\n    }\n    proposingStrategies {\n      strategy {\n        ...GovPowerStrategyFields\n      }\n    }\n    votingStrategies {\n      strategy {\n        ...GovPowerStrategyFields\n      }\n    }\n    timedFundingConfig {\n      ...TimedFundingRoundConfigFields\n    }\n  }\n',
): (typeof documents)['\n  fragment RoundFields on Round {\n    id\n    type\n    title\n    description\n    createdAt\n    eventState\n    manager {\n      id\n    }\n    proposingStrategies {\n      strategy {\n        ...GovPowerStrategyFields\n      }\n    }\n    votingStrategies {\n      strategy {\n        ...GovPowerStrategyFields\n      }\n    }\n    timedFundingConfig {\n      ...TimedFundingRoundConfigFields\n    }\n  }\n'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query manyHouses(\n    $first: Int!\n    $skip: Int!\n    $orderBy: House_orderBy\n    $orderDirection: OrderDirection\n    $where: House_filter\n  ) {\n    houses(\n      first: $first\n      skip: $skip\n      orderBy: $orderBy\n      orderDirection: $orderDirection\n      where: $where\n    ) {\n      ...HouseFields\n    }\n  }\n',
): (typeof documents)['\n  query manyHouses(\n    $first: Int!\n    $skip: Int!\n    $orderBy: House_orderBy\n    $orderDirection: OrderDirection\n    $where: House_filter\n  ) {\n    houses(\n      first: $first\n      skip: $skip\n      orderBy: $orderBy\n      orderDirection: $orderDirection\n      where: $where\n    ) {\n      ...HouseFields\n    }\n  }\n'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query house($id: ID!) {\n    house(id: $id) {\n      ...HouseFields\n    }\n  }\n',
): (typeof documents)['\n  query house($id: ID!) {\n    house(id: $id) {\n      ...HouseFields\n    }\n  }\n'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query manyRounds(\n    $first: Int!\n    $skip: Int!\n    $orderBy: Round_orderBy\n    $orderDirection: OrderDirection\n    $where: Round_filter\n  ) {\n    rounds(\n      first: $first\n      skip: $skip\n      orderBy: $orderBy\n      orderDirection: $orderDirection\n      where: $where\n    ) {\n      ...RoundFields\n    }\n  }\n',
): (typeof documents)['\n  query manyRounds(\n    $first: Int!\n    $skip: Int!\n    $orderBy: Round_orderBy\n    $orderDirection: OrderDirection\n    $where: Round_filter\n  ) {\n    rounds(\n      first: $first\n      skip: $skip\n      orderBy: $orderBy\n      orderDirection: $orderDirection\n      where: $where\n    ) {\n      ...RoundFields\n    }\n  }\n'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query manyRoundsWithHouseInfo(\n    $first: Int!\n    $skip: Int!\n    $orderBy: Round_orderBy\n    $orderDirection: OrderDirection\n    $where: Round_filter\n  ) {\n    rounds(\n      first: $first\n      skip: $skip\n      orderBy: $orderBy\n      orderDirection: $orderDirection\n      where: $where\n    ) {\n      ...RoundFields\n      house {\n        ...HouseFields\n      }\n    }\n  }\n',
): (typeof documents)['\n  query manyRoundsWithHouseInfo(\n    $first: Int!\n    $skip: Int!\n    $orderBy: Round_orderBy\n    $orderDirection: OrderDirection\n    $where: Round_filter\n  ) {\n    rounds(\n      first: $first\n      skip: $skip\n      orderBy: $orderBy\n      orderDirection: $orderDirection\n      where: $where\n    ) {\n      ...RoundFields\n      house {\n        ...HouseFields\n      }\n    }\n  }\n'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query round($id: ID!) {\n    round(id: $id) {\n      ...RoundFields\n    }\n  }\n',
): (typeof documents)['\n  query round($id: ID!) {\n    round(id: $id) {\n      ...RoundFields\n    }\n  }\n'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query roundWithHouseInfo($id: ID!) {\n    round(id: $id) {\n      ...RoundFields\n      house {\n        ...HouseFields\n      }\n    }\n  }\n',
): (typeof documents)['\n  query roundWithHouseInfo($id: ID!) {\n    round(id: $id) {\n      ...RoundFields\n      house {\n        ...HouseFields\n      }\n    }\n  }\n'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query manyBalances(\n    $first: Int!\n    $skip: Int!\n    $orderBy: Balance_orderBy\n    $orderDirection: OrderDirection\n    $where: Balance_filter\n  ) {\n    balances(\n      first: $first\n      skip: $skip\n      orderBy: $orderBy\n      orderDirection: $orderDirection\n      where: $where\n    ) {\n      id\n      asset {\n        assetType\n        token\n        identifier\n      }\n      balance\n      updatedAt\n    }\n  }\n',
): (typeof documents)['\n  query manyBalances(\n    $first: Int!\n    $skip: Int!\n    $orderBy: Balance_orderBy\n    $orderDirection: OrderDirection\n    $where: Balance_filter\n  ) {\n    balances(\n      first: $first\n      skip: $skip\n      orderBy: $orderBy\n      orderDirection: $orderDirection\n      where: $where\n    ) {\n      id\n      asset {\n        assetType\n        token\n        identifier\n      }\n      balance\n      updatedAt\n    }\n  }\n'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query manyGovPowerStrategies(\n    $first: Int!\n    $skip: Int!\n    $orderBy: GovPowerStrategy_orderBy\n    $orderDirection: OrderDirection\n    $where: GovPowerStrategy_filter\n  ) {\n    govPowerStrategies(\n      first: $first\n      skip: $skip\n      orderBy: $orderBy\n      orderDirection: $orderDirection\n      where: $where\n    ) {\n      ...GovPowerStrategyFields\n    }\n  }\n',
): (typeof documents)['\n  query manyGovPowerStrategies(\n    $first: Int!\n    $skip: Int!\n    $orderBy: GovPowerStrategy_orderBy\n    $orderDirection: OrderDirection\n    $where: GovPowerStrategy_filter\n  ) {\n    govPowerStrategies(\n      first: $first\n      skip: $skip\n      orderBy: $orderBy\n      orderDirection: $orderDirection\n      where: $where\n    ) {\n      ...GovPowerStrategyFields\n    }\n  }\n'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query manyDeposits(\n    $first: Int!\n    $skip: Int!\n    $orderBy: Deposit_orderBy\n    $orderDirection: OrderDirection\n    $where: Deposit_filter\n  ) {\n    deposits(\n      first: $first\n      skip: $skip\n      orderBy: $orderBy\n      orderDirection: $orderDirection\n      where: $where\n    ) {\n      id\n      depositedAt\n      asset {\n        assetType\n        token\n        identifier\n      }\n      amount\n      round {\n        id\n      }\n    }\n  }\n',
): (typeof documents)['\n  query manyDeposits(\n    $first: Int!\n    $skip: Int!\n    $orderBy: Deposit_orderBy\n    $orderDirection: OrderDirection\n    $where: Deposit_filter\n  ) {\n    deposits(\n      first: $first\n      skip: $skip\n      orderBy: $orderBy\n      orderDirection: $orderDirection\n      where: $where\n    ) {\n      id\n      depositedAt\n      asset {\n        assetType\n        token\n        identifier\n      }\n      amount\n      round {\n        id\n      }\n    }\n  }\n'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query manyClaims(\n    $first: Int!\n    $skip: Int!\n    $orderBy: Claim_orderBy\n    $orderDirection: OrderDirection\n    $where: Claim_filter\n  ) {\n    claims(\n      first: $first\n      skip: $skip\n      orderBy: $orderBy\n      orderDirection: $orderDirection\n      where: $where\n    ) {\n      id\n      claimedAt\n      recipient\n      proposalId\n      round {\n        id\n      }\n      asset {\n        assetType\n        token\n        identifier\n      }\n      amount\n    }\n  }\n',
): (typeof documents)['\n  query manyClaims(\n    $first: Int!\n    $skip: Int!\n    $orderBy: Claim_orderBy\n    $orderDirection: OrderDirection\n    $where: Claim_filter\n  ) {\n    claims(\n      first: $first\n      skip: $skip\n      orderBy: $orderBy\n      orderDirection: $orderDirection\n      where: $where\n    ) {\n      id\n      claimedAt\n      recipient\n      proposalId\n      round {\n        id\n      }\n      asset {\n        assetType\n        token\n        identifier\n      }\n      amount\n    }\n  }\n'];

export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> =
  TDocumentNode extends DocumentNode<infer TType, any> ? TType : never;
