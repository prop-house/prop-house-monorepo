import { graphql } from './evm';

export const TimedFundingRoundConfigParts = graphql(`
  fragment TimedFundingRoundConfigParts on TimedFundingRoundConfig {
    winnerCount
    proposalPeriodStartTimestamp
    proposalPeriodDuration
    votePeriodStartTimestamp
    votePeriodDuration
    votingStrategies {
      id
      type
      address
      params
    }
    awards {
      asset {
        assetType
        token
        identifier
      }
      amount
    }
  }
`);

export const ManyHousesSimpleQuery = graphql(`
  query manyHousesSimple(
    $first: Int!
    $skip: Int!
    $orderBy: House_orderBy
    $orderDirection: OrderDirection
  ) {
    houses(first: $first, skip: $skip, orderBy: $orderBy, orderDirection: $orderDirection) {
      id
      name
      description
      imageURI
      createdAt
    }
  }
`);

export const ManyRoundsSimpleQuery = graphql(`
  query manyRoundsSimple(
    $first: Int!
    $skip: Int!
    $orderBy: Round_orderBy
    $orderDirection: OrderDirection
  ) {
    rounds(first: $first, skip: $skip, orderBy: $orderBy, orderDirection: $orderDirection) {
      id
      type
      title
      description
      createdAt
      state
    }
  }
`);

export const ManyRoundsSimpleForHouseQuery = graphql(`
  query manyRoundsSimpleForHouse(
    $house: String!
    $first: Int!
    $skip: Int!
    $orderBy: Round_orderBy
    $orderDirection: OrderDirection
  ) {
    rounds(
      first: $first
      skip: $skip
      orderBy: $orderBy
      orderDirection: $orderDirection
      where: { house: $house }
    ) {
      id
      type
      title
      description
      createdAt
      state
    }
  }
`);

export const ManyRoundsSimpleWhereTitleContainsQuery = graphql(`
  query manyRoundsSimpleWhereTitleContains(
    $titleContains: String!
    $first: Int!
    $skip: Int!
    $orderBy: Round_orderBy
    $orderDirection: OrderDirection
  ) {
    rounds(
      first: $first
      skip: $skip
      orderBy: $orderBy
      orderDirection: $orderDirection
      where: { title_contains_nocase: $titleContains }
    ) {
      id
      type
      title
      description
      createdAt
      state
    }
  }
`);

export const RoundQuery = graphql(`
  query round($id: ID!) {
    round(id: $id) {
      id
      type
      title
      description
      createdAt
      state
      manager {
        id
      }
      timedFundingConfig {
        ...TimedFundingRoundConfigParts
      }
    }
  }
`);
