import { GraphQLClient } from 'graphql-request';
import {
  Balance_OrderBy,
  Claim_OrderBy,
  Deposit_OrderBy,
  House_OrderBy,
  Round_OrderBy,
} from './evm/graphql';
import {
  ManyClaimsByAccountQuery,
  ManyDepositsByAccountQuery,
  ManyHousesSimpleQuery,
  ManyHousesSimpleWhereAccountHasCreatorPermissionsQuery,
  ManyHousesSimpleWhereAccountIsOwnerQuery,
  ManyRoundBalancesQuery,
  ManyRoundsSimpleForHouseQuery,
  ManyRoundsSimpleManagedByAccountQuery,
  ManyRoundsSimpleQuery,
  ManyRoundsSimpleWhereTitleContainsQuery,
  RoundQuery,
} from './queries.evm';
import { getDefaultConfig, getGraphQlClientsForChainOrThrow, toPaginated } from './utils';
import { OrderByProposalFields, OrderByVoteFields } from './starknet/graphql';
import { GraphQL } from '../types';
import {
  ManyProposalsByAccountQuery,
  ManyProposalsForRoundQuery,
  ManyVotesByAccountQuery,
} from './queries.starknet';

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
   * Get paginated houses where the provided account has creator permissions
   * @param account The account address
   * @param config Pagination and ordering configuration
   */
  public async getHousesWhereAccountHasCreatorPermissions(
    account: string,
    config = getDefaultConfig(Round_OrderBy.CreatedAt),
  ) {
    return this._gql.evm.request(ManyHousesSimpleWhereAccountHasCreatorPermissionsQuery, {
      ...toPaginated(config),
      creator: account.toLowerCase(),
    });
  }

  /**
   * Get paginated houses where the provided account is the house owner
   * @param account The account address
   * @param config Pagination and ordering configuration
   */
  public async getHousesWhereAccountIsOwner(
    account: string,
    config = getDefaultConfig(Round_OrderBy.CreatedAt),
  ) {
    return this._gql.evm.request(ManyHousesSimpleWhereAccountIsOwnerQuery, {
      ...toPaginated(config),
      owner: account.toLowerCase(),
    });
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

  /**
   * Get balance information for a single round
   * @param round The round address
   * @param config Pagination and ordering configuration
   */
  public async getRoundBalances(
    round: string,
    config = getDefaultConfig(Balance_OrderBy.UpdatedAt),
  ) {
    return this._gql.evm.request(ManyRoundBalancesQuery, {
      ...toPaginated(config),
      round: round.toLowerCase(),
    });
  }

  /**
   * Get paginated rounds currently managed by the provided account address
   * @param account The account address
   * @param config Pagination and ordering configuration
   */
  public async getRoundsManagedByAccount(
    account: string,
    config = getDefaultConfig(Round_OrderBy.CreatedAt),
  ) {
    return this._gql.evm.request(ManyRoundsSimpleManagedByAccountQuery, {
      ...toPaginated(config),
      manager: account.toLowerCase(),
    });
  }

  /**
   * Get paginated round deposits by the provided account address
   * @param account The depositor address
   * @param config Pagination and ordering configuration
   */
  public async getRoundDepositsByAccount(
    account: string,
    config = getDefaultConfig(Deposit_OrderBy.DepositedAt),
  ) {
    return this._gql.evm.request(ManyDepositsByAccountQuery, {
      ...toPaginated(config),
      depositor: account.toLowerCase(),
    });
  }

  /**
   * Get paginated round claims by the provided account address
   * @param account The claimer address
   * @param config Pagination and ordering configuration
   */
  public async getRoundClaimsByAccount(
    account: string,
    config = getDefaultConfig(Claim_OrderBy.ClaimedAt),
  ) {
    return this._gql.evm.request(ManyClaimsByAccountQuery, {
      ...toPaginated(config),
      claimer: account.toLowerCase(),
    });
  }

  /**
   * Get paginated proposals by the provided account address
   * @param round The account address
   * @param config Pagination and ordering configuration
   */
  public async getProposalsByAccount(
    account: string,
    config = getDefaultConfig(OrderByProposalFields.ReceivedAt),
  ) {
    return this._gql.starknet.request(ManyProposalsByAccountQuery, {
      ...toPaginated(config),
      proposer: account.toLowerCase(),
    });
  }

  /**
   * Get paginated votes by the provided account address
   * @param round The account address
   * @param config Pagination and ordering configuration
   */
  public async getVotesByAccount(
    account: string,
    config = getDefaultConfig(OrderByVoteFields.ReceivedAt),
  ) {
    return this._gql.starknet.request(ManyVotesByAccountQuery, {
      ...toPaginated(config),
      voter: account.toLowerCase(),
    });
  }

  /**
   * Get paginated proposals for the provided round address
   * @param round The round address
   * @param config Pagination and ordering configuration
   */
  public async getProposalsForRound(
    round: string,
    config = getDefaultConfig(OrderByProposalFields.ReceivedAt),
  ) {
    return this._gql.starknet.request(ManyProposalsForRoundQuery, {
      ...toPaginated(config),
      round: round.toLowerCase(),
    });
  }
}
