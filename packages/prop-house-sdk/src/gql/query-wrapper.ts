import { GraphQLClient } from 'graphql-request';
import { House_OrderBy, Round_OrderBy } from './evm/graphql';
import {
  ManyHousesSimpleQuery,
  ManyRoundsSimpleForHouseQuery,
  ManyRoundsSimpleQuery,
  ManyRoundsSimpleWhereTitleContainsQuery,
  RoundQuery,
} from './queries.evm';
import { getDefaultConfig, getGraphQlClientsForChainOrThrow, toPaginated } from './utils';
import { GraphQL } from '../types';

export class QueryWrapper {
  private readonly _gql: GraphQL<GraphQLClient>;

  /**
   * Underlying GraphQL client instances
   */
  public get gql() {
    return this._gql;
  }

  /**
   * @param chainId The active source chain ID
   */
  constructor(chainId: number) {
    this._gql = getGraphQlClientsForChainOrThrow(chainId, url => new GraphQLClient(url));
  }

  /**
   * Get high-level house information for many houses
   * @param config Pagination and ordering configuration
   */
  public async getHouses(config = getDefaultConfig(House_OrderBy.CreatedAt)) {
    return this._gql.evm.request(ManyHousesSimpleQuery, toPaginated(config));
  }

  /**
   * Get high-level round information for many rounds
   * @param config Pagination and ordering configuration
   */
  public async getRounds(config = getDefaultConfig(Round_OrderBy.CreatedAt)) {
    return this._gql.evm.request(ManyRoundsSimpleQuery, toPaginated(config));
  }

  /**
   * Get high-level round information for many rounds on the provided house
   * @param house The house address
   * @param config Pagination and ordering configuration
   */
  public async getRoundsForHouse(
    house: string,
    config = getDefaultConfig(Round_OrderBy.CreatedAt),
  ) {
    return this._gql.evm.request(ManyRoundsSimpleForHouseQuery, {
      ...toPaginated(config),
      house: house.toLowerCase(),
    });
  }

  /**
   * Get high-level round information for many rounds where the title contains `titleContains`
   * @param titleContains The partial title text
   * @param config Pagination and ordering configuration
   */
  public async getRoundsWhereTitleContains(
    titleContains: string,
    config = getDefaultConfig(Round_OrderBy.CreatedAt),
  ) {
    return this._gql.evm.request(ManyRoundsSimpleWhereTitleContainsQuery, {
      ...toPaginated(config),
      titleContains,
    });
  }

  /**
   * Get detailed information for a single round
   * @param round The round address
   */
  public async getRound(round: string) {
    return this._gql.evm.request(RoundQuery, { id: round.toLowerCase() });
  }
}
