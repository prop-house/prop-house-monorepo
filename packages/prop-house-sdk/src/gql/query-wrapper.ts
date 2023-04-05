import { GraphQLClient } from 'graphql-request';
import {
  Balance_OrderBy,
  Claim_OrderBy,
  Deposit_OrderBy,
  House_OrderBy,
  Round_OrderBy,
  VotingStrategy_OrderBy,
} from './evm/graphql';
import {
  ManyClaimsByAccountQuery,
  ManyDepositsByAccountQuery,
  ManyHousesSimpleQuery,
  ManyHousesSimpleWhereAccountHasCreatorPermissionsQuery,
  ManyHousesSimpleWhereAccountIsOwnerOrHasCreatorPermissionsQuery,
  ManyHousesSimpleWhereAccountIsOwnerQuery,
  ManyRoundBalancesQuery,
  ManyRoundsSimpleForHouseQuery,
  ManyRoundsSimpleManagedByAccountQuery,
  ManyRoundsSimpleQuery,
  ManyRoundsSimpleWhereTitleContainsQuery,
  ManyRoundVotingStrategiesQuery,
  RoundQuery,
} from './queries.evm';
import {
  getDefaultConfig,
  getGraphQlClientsForChainOrThrow,
  QueryConfig,
  toPaginated,
} from './utils';
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
   * Returns a `QueryWrapper` instance for the provided chain ID
   * @param chainId The active source chain ID
   */
  public static for(chainId: number) {
    return new QueryWrapper(chainId);
  }

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
  public async getHouses(config: Partial<QueryConfig<House_OrderBy>> = {}) {
    return this._gql.evm.request(
      ManyHousesSimpleQuery,
      toPaginated(this.merge(getDefaultConfig(House_OrderBy.CreatedAt), config)),
    );
  }

  /**
   * Get paginated houses where the provided account has creator permissions
   * @param account The account address
   * @param config Pagination and ordering configuration
   */
  public async getHousesWhereAccountHasCreatorPermissions(
    account: string,
    config: Partial<QueryConfig<House_OrderBy>> = {},
  ) {
    return this._gql.evm.request(ManyHousesSimpleWhereAccountHasCreatorPermissionsQuery, {
      ...toPaginated(this.merge(getDefaultConfig(House_OrderBy.CreatedAt), config)),
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
    config: Partial<QueryConfig<House_OrderBy>> = {},
  ) {
    return this._gql.evm.request(ManyHousesSimpleWhereAccountIsOwnerQuery, {
      ...toPaginated(this.merge(getDefaultConfig(House_OrderBy.CreatedAt), config)),
      owner: account.toLowerCase(),
    });
  }

  /**
   * Get paginated houses where the provided account is the house owner
   * or has creator permissions
   * @param account The account address
   * @param config Pagination and ordering configuration
   */
  public async getHousesWhereAccountIsOwnerOrHasCreatorPermissions(
    account: string,
    config: Partial<QueryConfig<House_OrderBy>> = {},
  ) {
    return this._gql.evm.request(ManyHousesSimpleWhereAccountIsOwnerOrHasCreatorPermissionsQuery, {
      ...toPaginated(this.merge(getDefaultConfig(House_OrderBy.CreatedAt), config)),
      ownerOrCreator: account.toLowerCase(),
    });
  }

  /**
   * Get high-level round information for many rounds
   * @param config Pagination and ordering configuration
   */
  public async getRounds(config: Partial<QueryConfig<Round_OrderBy>> = {}) {
    return this._gql.evm.request(
      ManyRoundsSimpleQuery,
      toPaginated(this.merge(getDefaultConfig(Round_OrderBy.CreatedAt), config)),
    );
  }

  /**
   * Get high-level round information for many rounds on the provided house
   * @param house The house address
   * @param config Pagination and ordering configuration
   */
  public async getRoundsForHouse(house: string, config: Partial<QueryConfig<Round_OrderBy>> = {}) {
    return this._gql.evm.request(ManyRoundsSimpleForHouseQuery, {
      ...toPaginated(this.merge(getDefaultConfig(Round_OrderBy.CreatedAt), config)),
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
    config: Partial<QueryConfig<Round_OrderBy>> = {},
  ) {
    return this._gql.evm.request(ManyRoundsSimpleWhereTitleContainsQuery, {
      ...toPaginated(this.merge(getDefaultConfig(Round_OrderBy.CreatedAt), config)),
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
  public async getRoundBalances(round: string, config: Partial<QueryConfig<Balance_OrderBy>> = {}) {
    return this._gql.evm.request(ManyRoundBalancesQuery, {
      ...toPaginated(this.merge(getDefaultConfig(Balance_OrderBy.UpdatedAt), config)),
      round: round.toLowerCase(),
    });
  }

  /**
   * Get voting strategy information for a single round
   * @param round The round address
   * @param config Pagination and ordering configuration
   */
  public async getRoundVotingStrategies(
    round: string,
    config: Partial<QueryConfig<VotingStrategy_OrderBy>> = {},
  ) {
    return this._gql.evm.request(ManyRoundVotingStrategiesQuery, {
      ...toPaginated(this.merge(getDefaultConfig(VotingStrategy_OrderBy.Id), config)),
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
    config: Partial<QueryConfig<Round_OrderBy>> = {},
  ) {
    return this._gql.evm.request(ManyRoundsSimpleManagedByAccountQuery, {
      ...toPaginated(this.merge(getDefaultConfig(Round_OrderBy.CreatedAt), config)),
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
    config: Partial<QueryConfig<Deposit_OrderBy>> = {},
  ) {
    return this._gql.evm.request(ManyDepositsByAccountQuery, {
      ...toPaginated(this.merge(getDefaultConfig(Deposit_OrderBy.DepositedAt), config)),
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
    config: Partial<QueryConfig<Claim_OrderBy>> = {},
  ) {
    return this._gql.evm.request(ManyClaimsByAccountQuery, {
      ...toPaginated(this.merge(getDefaultConfig(Claim_OrderBy.ClaimedAt), config)),
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
    config: Partial<QueryConfig<OrderByProposalFields>> = {},
  ) {
    return this._gql.starknet.request(ManyProposalsByAccountQuery, {
      ...toPaginated(this.merge(getDefaultConfig(OrderByProposalFields.ReceivedAt), config)),
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
    config: Partial<QueryConfig<OrderByVoteFields>> = {},
  ) {
    return this._gql.starknet.request(ManyVotesByAccountQuery, {
      ...toPaginated(this.merge(getDefaultConfig(OrderByVoteFields.ReceivedAt), config)),
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
    config: Partial<QueryConfig<OrderByProposalFields>> = {},
  ) {
    return this._gql.starknet.request(ManyProposalsForRoundQuery, {
      ...toPaginated(this.merge(getDefaultConfig(OrderByProposalFields.ReceivedAt), config)),
      round: round.toLowerCase(),
    });
  }

  /**
   * Merge a user and a default configuration
   * @param defaultConfig The default configuration
   * @param userConfig The user-provided partial configuration
   */
  protected merge<OB>(defaultConfig: QueryConfig<OB>, userConfig: Partial<QueryConfig<OB>>) {
    return {
      ...defaultConfig,
      ...userConfig,
    };
  }
}
