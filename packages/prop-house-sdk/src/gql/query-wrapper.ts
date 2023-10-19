import { GraphQLClient } from 'graphql-request';
import {
  Balance_OrderBy,
  Claim_OrderBy,
  Deposit_OrderBy,
  House_OrderBy,
  Round_OrderBy,
  GovPowerStrategy_OrderBy,
  RoundQuery as IRoundQuery,
  RoundWithHouseInfoQuery as IRoundWithHouseInfoQuery,
  HouseQuery as IHouseQuery,
  House_Filter,
  Round_Filter,
  Balance_Filter,
  GovPowerStrategy_Filter,
  Deposit_Filter,
  Claim_Filter,
} from './evm/graphql';
import {
  HouseQuery,
  ManyBalancesQuery,
  ManyClaimsQuery,
  ManyDepositsQuery,
  ManyHousesQuery,
  ManyRoundsQuery,
  ManyRoundsWithHouseInfoQuery,
  ManyGovPowerStrategiesQuery,
  RoundQuery,
  RoundWithHouseInfoQuery,
} from './queries.evm';
import {
  getDefaultConfig,
  getGraphQlClientsForChainOrThrow,
  QueryConfig,
  toPaginated,
} from './utils';
import {
  ProposalQuery as IProposalQuery,
  OrderByProposalFields,
  OrderByVoteFields,
  Proposal_Filter,
  Vote_Filter,
} from './starknet/graphql';
import { Address, GovPowerStrategyType, GraphQL, RoundType } from '../types';
import {
  GlobalStats,
  House,
  Proposal,
  Round,
  ParsedGovPowerStrategy,
  RoundWithHouse,
  Vote,
  RoundAward,
} from './types';
import {
  GlobalStatsQuery,
  ManyProposalsQuery,
  ManyVotesQuery,
  ProposalQuery,
  RoundIdQuery,
} from './queries.starknet';
import { RoundManager } from '../rounds';

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
   * Get global protocol stats, including total rounds, proposals, and vote submissions.
   */
  public async getGlobalStats(): Promise<GlobalStats> {
    const { summary } = await this._gql.starknet.request(GlobalStatsQuery);
    return summary!;
  }

  /**
   * Get house information for many houses
   * @param config Filtering, pagination, and ordering configuration
   */
  public async getHouses(
    config: Partial<QueryConfig<House_OrderBy, House_Filter>> = {},
  ): Promise<House[]> {
    const { houses } = await this._gql.evm.request(
      ManyHousesQuery,
      toPaginated(this.merge(getDefaultConfig(House_OrderBy.CreatedAt), config)),
    );
    return houses.map(house => this.toHouse(house));
  }

  /**
   * Get paginated houses where the provided account has creator permissions
   * @param accountAddress The account address
   * @param config Filtering, pagination, and ordering configuration
   */
  public async getHousesWhereAccountHasCreatorPermissions(
    accountAddress: Address,
    config: Partial<QueryConfig<House_OrderBy, House_Filter>> = {},
  ): Promise<House[]> {
    return this.getHouses({
      ...config,
      where: {
        ...config.where,
        roundCreators_: { creator: accountAddress.toLowerCase() },
      },
    });
  }

  /**
   * Get paginated houses where the provided account is the house owner
   * @param accountAddress The account address
   * @param config Filtering, pagination, and ordering configuration
   */
  public async getHousesWhereAccountIsOwner(
    accountAddress: Address,
    config: Partial<QueryConfig<House_OrderBy, House_Filter>> = {},
  ): Promise<House[]> {
    return this.getHouses({
      ...config,
      where: { ...config.where, owner: accountAddress.toLowerCase() },
    });
  }

  /**
   * Get paginated houses where the provided account is the house owner
   * or has creator permissions
   * @param accountAddress The account address
   * @param config Filtering, pagination, and ordering configuration
   */
  public async getHousesWhereAccountIsOwnerOrHasCreatorPermissions(
    accountAddress: Address,
    config: Partial<QueryConfig<House_OrderBy, House_Filter>> = {},
  ): Promise<House[]> {
    const ownerOrCreator = accountAddress.toLowerCase();
    return this.getHouses({
      ...config,
      where: {
        ...config.where,
        or: [{ roundCreators_: { creator: ownerOrCreator } }, { owner: ownerOrCreator }],
      },
    });
  }

  /**
   * Get detailed house information
   * @param houseAddress The house address
   */
  public async getHouse(houseAddress: Address): Promise<House> {
    const { house } = await this._gql.evm.request(HouseQuery, { id: houseAddress.toLowerCase() });
    if (!house) {
      throw new Error(`House not found: ${houseAddress}`);
    }
    return this.toHouse(house);
  }

  /**
   * Get high-level round information for many rounds
   * @param config Filtering, pagination, and ordering configuration
   */
  public async getRounds(
    config: Partial<QueryConfig<Round_OrderBy, Round_Filter>> = {},
  ): Promise<Round[]> {
    const { rounds } = await this._gql.evm.request(
      ManyRoundsQuery,
      toPaginated(this.merge(getDefaultConfig(Round_OrderBy.CreatedAt), config)),
    );
    return rounds.map(round => this.toRound(round));
  }

  /**
   * Get high-level round information for many rounds on the provided house
   * @param houseAddress The house address
   * @param config Filtering, pagination, and ordering configuration
   */
  public async getRoundsForHouse(
    houseAddress: Address,
    config: Partial<QueryConfig<Round_OrderBy, Round_Filter>> = {},
  ): Promise<Round[]> {
    return this.getRounds({
      ...config,
      where: {
        ...config.where,
        house: houseAddress.toLowerCase(),
      },
    });
  }

  /**
   * Get high-level round information for many rounds where the title contains `titleContains`
   * @param titleContains The partial title text
   * @param config Filtering, pagination, and ordering configuration
   */
  public async getRoundsWhereTitleContains(
    titleContains: string,
    config: Partial<QueryConfig<Round_OrderBy, Round_Filter>> = {},
  ): Promise<Round[]> {
    return this.getRounds({
      ...config,
      where: {
        ...config.where,
        title_contains_nocase: titleContains,
      },
    });
  }

  /**
   * Get paginated rounds currently managed by the provided account address
   * @param accountAddress The account address
   * @param config Filtering, pagination, and ordering configuration
   */
  public async getRoundsManagedByAccount(
    accountAddress: Address,
    config: Partial<QueryConfig<Round_OrderBy, Round_Filter>> = {},
  ): Promise<Round[]> {
    return this.getRounds({
      ...config,
      where: {
        ...config.where,
        manager: accountAddress.toLowerCase(),
      },
    });
  }

  /**
   * Get high-level round information, including house details, for many rounds
   * @param config Filtering, pagination, and ordering configuration
   */
  public async getRoundsWithHouseInfo(
    config: Partial<QueryConfig<Round_OrderBy, Round_Filter>> = {},
  ): Promise<RoundWithHouse[]> {
    const { rounds } = await this._gql.evm.request(
      ManyRoundsWithHouseInfoQuery,
      toPaginated(this.merge(getDefaultConfig(Round_OrderBy.CreatedAt), config)),
    );
    return rounds.map(round => this.toRoundWithHouseInfo(round));
  }

  /**
   * Get high-level round information, including house details, for many rounds
   * where the title contains `titleContains`.
   * @param titleContains The partial title text
   * @param config Filtering, pagination, and ordering configuration
   */
  public async getRoundsWithHouseInfoWhereTitleContains(
    titleContains: string,
    config: Partial<QueryConfig<Round_OrderBy, Round_Filter>> = {},
  ): Promise<RoundWithHouse[]> {
    return this.getRoundsWithHouseInfo({
      ...config,
      where: {
        ...config.where,
        title_contains_nocase: titleContains,
      },
    });
  }

  /**
   * Get paginated rounds, with house details, that are currently managed
   * by the provided account address.
   * @param accountAddress The account address
   * @param config Filtering, pagination, and ordering configuration
   */
  public async getRoundsWithHouseInfoManagedByAccount(
    accountAddress: Address,
    config: Partial<QueryConfig<Round_OrderBy, Round_Filter>> = {},
  ): Promise<RoundWithHouse[]> {
    return this.getRoundsWithHouseInfo({
      ...config,
      where: {
        ...config.where,
        manager: accountAddress.toLowerCase(),
      },
    });
  }

  /**
   * Get detailed information for a single round
   * @param roundAddress The round address
   */
  public async getRound(roundAddress: Address): Promise<Round> {
    const { round } = await this._gql.evm.request(RoundQuery, { id: roundAddress.toLowerCase() });
    if (!round) {
      throw new Error(`Round not found: ${roundAddress}`);
    }
    return this.toRound(round);
  }

  /**
   * Get the Starknet round address for a given origin chain round address
   * @param roundAddress The round address
   */
  public async getStarknetRoundAddress(roundAddress: Address): Promise<string> {
    const { rounds } = await this._gql.starknet.request(RoundIdQuery, {
      sourceChainRound: roundAddress.toLowerCase(),
    });
    if (!rounds?.length) {
      throw new Error(`Round not found: ${roundAddress}`);
    }
    return rounds?.[0]!.id;
  }

  /**
   * Get detailed information for a single round, including house information
   * @param roundAddress The round address
   */
  public async getRoundWithHouseInfo(roundAddress: Address): Promise<RoundWithHouse> {
    const { round } = await this._gql.evm.request(RoundWithHouseInfoQuery, {
      id: roundAddress.toLowerCase(),
    });
    if (!round) {
      throw new Error(`Round not found: ${roundAddress}`);
    }
    return this.toRoundWithHouseInfo(round);
  }

  /**
   * Get balance information
   * @param config Filtering, pagination, and ordering configuration
   */
  public async getBalances(config: Partial<QueryConfig<Balance_OrderBy, Balance_Filter>> = {}) {
    return this._gql.evm.request(
      ManyBalancesQuery,
      toPaginated(this.merge(getDefaultConfig(Balance_OrderBy.UpdatedAt), config)),
    );
  }

  /**
   * Get balance information for a single round
   * @param roundAddress The round address
   * @param config Filtering, pagination, and ordering configuration
   */
  public async getRoundBalances(
    roundAddress: Address,
    config: Partial<QueryConfig<Balance_OrderBy, Balance_Filter>> = {},
  ) {
    return this.getBalances({
      ...config,
      where: {
        ...config.where,
        round: roundAddress.toLowerCase(),
      },
    });
  }

  /**
   * Get parsed governance power strategy information
   * @param config Filtering, pagination, and ordering configuration
   */
  public async getGovPowerStrategies(
    config: Partial<QueryConfig<GovPowerStrategy_OrderBy, GovPowerStrategy_Filter>> = {},
  ) {
    const { govPowerStrategies: govPowerStrategiesRaw } = await this._gql.evm.request(
      ManyGovPowerStrategiesQuery,
      toPaginated(this.merge(getDefaultConfig(GovPowerStrategy_OrderBy.Id), config)),
    );
    return {
      govPowerStrategiesRaw,
      govPowerStrategies: govPowerStrategiesRaw.map(strategy => this.toParsedGovPowerStrategy(strategy)),
    };
  }

  /**
   * Get proposing strategy information for a single round
   * @param roundAddress The round address
   * @param config Filtering, pagination, and ordering configuration
   */
  public async getRoundProposingStrategies(
    roundAddress: Address,
    config: Partial<QueryConfig<GovPowerStrategy_OrderBy, GovPowerStrategy_Filter>> = {},
  ) {
    return this.getGovPowerStrategies({
      ...config,
      where: {
        ...config.where,
        proposingStrategyRounds_: { round: roundAddress.toLowerCase() },
      },
    });
  }

  /**
   * Get voting strategy information for a single round
   * @param roundAddress The round address
   * @param config Filtering, pagination, and ordering configuration
   */
  public async getRoundVotingStrategies(
    roundAddress: Address,
    config: Partial<QueryConfig<GovPowerStrategy_OrderBy, GovPowerStrategy_Filter>> = {},
  ) {
    return this.getGovPowerStrategies({
      ...config,
      where: {
        ...config.where,
        votingStrategyRounds_: { round: roundAddress.toLowerCase() },
      },
    });
  }

  /**
   * Get paginated round deposits
   * @param config Filtering, pagination, and ordering configuration
   */
  public async getDeposits(config: Partial<QueryConfig<Deposit_OrderBy, Deposit_Filter>> = {}) {
    return this._gql.evm.request(
      ManyDepositsQuery,
      toPaginated(this.merge(getDefaultConfig(Deposit_OrderBy.DepositedAt), config)),
    );
  }

  /**
   * Get paginated round deposits by the provided account address
   * @param depositorAddress The depositor address
   * @param config Filtering, pagination, and ordering configuration
   */
  public async getRoundDepositsByAccount(
    depositorAddress: Address,
    config: Partial<QueryConfig<Deposit_OrderBy, Deposit_Filter>> = {},
  ) {
    return this.getDeposits({
      ...config,
      where: {
        ...config.where,
        depositor: depositorAddress.toLowerCase(),
      },
    });
  }

  /**
   * Get paginated round claims
   * @param config Filtering, pagination, and ordering configuration
   */
  public async getClaims(config: Partial<QueryConfig<Claim_OrderBy, Claim_Filter>> = {}) {
    return this._gql.evm.request(
      ManyClaimsQuery,
      toPaginated(this.merge(getDefaultConfig(Claim_OrderBy.ClaimedAt), config)),
    );
  }

  /**
   * Get paginated round claims by the provided account address
   * @param claimerAddress The claimer address
   * @param config Filtering, pagination, and ordering configuration
   */
  public async getRoundClaimsByAccount(
    claimerAddress: Address,
    config: Partial<QueryConfig<Claim_OrderBy, Claim_Filter>> = {},
  ) {
    return this.getClaims({
      ...config,
      where: {
        ...config.where,
        claimer: claimerAddress.toLowerCase(),
      },
    });
  }

  /**
   * Get paginated proposals
   * @param config Filtering, pagination, and ordering configuration
   */
  public async getProposals(
    config: Partial<QueryConfig<OrderByProposalFields, Proposal_Filter>> = {},
  ): Promise<Proposal[]> {
    const { proposals } = await this._gql.starknet.request(
      ManyProposalsQuery,
      toPaginated(this.merge(getDefaultConfig(OrderByProposalFields.ReceivedAt), config)),
    );
    return proposals!.map(p => this.toProposal(p));
  }

  /**
   * Get paginated proposals by the provided proposer address
   * @param proposerAddress The proposer address
   * @param config Filtering, pagination, and ordering configuration
   */
  public async getProposalsByAccount(
    proposerAddress: Address,
    config: Partial<QueryConfig<OrderByProposalFields, Proposal_Filter>> = {},
  ) {
    return this.getProposals({
      ...config,
      where: {
        ...config.where,
        proposer: proposerAddress.toLowerCase(),
      },
    });
  }

  /**
   * Get paginated proposals for the provided round address
   * @param roundAddress The round address
   * @param config Filtering, pagination, and ordering configuration
   */
  public async getProposalsForRound(
    roundAddress: Address,
    config: Partial<QueryConfig<OrderByProposalFields, Proposal_Filter>> = {},
  ) {
    return this.getProposals({
      ...config,
      where: {
        ...config.where,
        round_: {
          ...config.where?.round_,
          sourceChainRound: roundAddress.toLowerCase(),
        },
      },
    });
  }

  /**
   * Fetch a proposal using the provided round address and proposal ID
   * @param roundAddress The round address
   * @param proposalId The proposal id
   */
  public async getProposal(roundAddress: string, proposalId: number): Promise<Proposal> {
    const proposals = await this.getProposals({
      where: {
        proposalId,
        round_: {
          sourceChainRound: roundAddress.toLowerCase(),
        },
      },
    });
    if (!proposals?.length) {
      throw new Error(`Proposal ID ${proposalId} not found for round ${roundAddress}`);
    }
    return proposals[0];
  }

  /**
   * Get paginated votes
   * @param config Filtering, pagination, and ordering configuration
   */
  public async getVotes(
    config: Partial<QueryConfig<OrderByVoteFields, Vote_Filter>> = {},
  ): Promise<Vote[]> {
    const { votes } = await this._gql.starknet.request(
      ManyVotesQuery,
      toPaginated(this.merge(getDefaultConfig(OrderByVoteFields.ReceivedAt), config)),
    );
    return votes!.map(v => ({
      voter: v!.voter.id,
      round: v!.round.sourceChainRound,
      proposalId: v!.proposal.proposalId,
      votingPower: v!.votingPower,
      receivedAt: v!.receivedAt,
      txHash: v!.txHash,
    }));
  }

  /**
   * Get paginated votes for the provided round address and proposal id
   * @param roundAddress The round address
   * @param proposalId The proposal ID
   * @param config Filtering, pagination, and ordering configuration
   */
  public async getVotesForProposal(
    roundAddress: Address,
    proposalId: number,
    config: Partial<QueryConfig<OrderByVoteFields, Vote_Filter>> = {},
  ): Promise<Vote[]> {
    return this.getVotes({
      ...config,
      where: {
        ...config.where,
        round_: {
          ...config.where?.round_,
          sourceChainRound: roundAddress.toLowerCase(),
        },
        proposal_: {
          ...config.where?.proposal_,
          proposalId,
        },
      },
    });
  }

  /**
   * Get paginated votes by the provided voter address
   * @param voterAddress The voter address
   * @param config Filtering, pagination, and ordering configuration
   */
  public async getVotesByAccount(
    voterAddress: Address,
    config: Partial<QueryConfig<OrderByVoteFields, Vote_Filter>> = {},
  ): Promise<Vote[]> {
    return this.getVotes({
      ...config,
      where: {
        ...config.where,
        voter: voterAddress.toLowerCase(),
      },
    });
  }

  /**
   * Get paginated votes by the provided voter address in a specific round
   * @param voterAddress The voter address
   * @param roundAddress The round address
   * @param config Filtering, pagination, and ordering configuration
   */
  public async getVotesByAccountForRound(
    voterAddress: Address,
    roundAddress: string,
    config: Partial<QueryConfig<OrderByVoteFields, Vote_Filter>> = {},
  ): Promise<Vote[]> {
    return this.getVotes({
      ...config,
      where: {
        ...config.where,
        voter: voterAddress.toLowerCase(),
        round_: {
          sourceChainRound: roundAddress.toLowerCase(),
        },
      },
    });
  }

  /**
   * Convert a raw house query result to a house object
   * @param house The house to convert
   */
  protected toHouse(house: IHouseQuery['house']): House {
    if (!house) throw new Error('House information not present during attempted conversion');
    return {
      address: house.id,
      name: house.metadata?.name,
      description: house.metadata?.description,
      imageURI: house.metadata?.imageURI,
      createdAt: house.createdAt,
      roundCount: house.roundCount,
      owner: house.owner?.id,
      roundCreators: house.roundCreators.map(({ creator, passCount }) => ({
        account: creator.id,
        passCount,
      })),
    };
  }

  /**
   * Convert a raw round query result to a round object
   * @param round The round to convert
   */
  protected toRound(round: IRoundQuery['round']): Round {
    if (!round) throw new Error('Round information not present during attempted conversion');
    if (!round.timedConfig)
      throw new Error('Round config information not present during attempted conversion');

    const config = round.timedConfig;
    const proposingStrategiesRaw = round.proposingStrategies.map(({ strategy }) => strategy);
    const votingStrategiesRaw = round.votingStrategies.map(({ strategy }) => strategy);
    return {
      address: round.id,
      type: round.type as RoundType,
      title: round.title,
      description: round.description,
      createdAt: round.createdAt,
      state: RoundManager.getState(round.type, {
        eventState: round.eventState,
        config,
      }),
      config: {
        ...config,
        proposalThreshold: Number(config.proposalThreshold),
        proposalPeriodStartTimestamp: Number(config.proposalPeriodStartTimestamp),
        proposalPeriodEndTimestamp: Number(config.proposalPeriodEndTimestamp),
        proposalPeriodDuration: Number(config.proposalPeriodDuration),
        votePeriodStartTimestamp: Number(config.votePeriodStartTimestamp),
        votePeriodEndTimestamp: Number(config.votePeriodEndTimestamp),
        votePeriodDuration: Number(config.votePeriodDuration),
        claimPeriodEndTimestamp: Number(config.claimPeriodEndTimestamp),
        awards: this.toParsedAwards(config.winnerCount, config.awards),
      },
      proposingStrategiesRaw,
      votingStrategiesRaw,
      proposingStrategies: proposingStrategiesRaw.map(strategy => this.toParsedGovPowerStrategy(strategy)),
      votingStrategies: votingStrategiesRaw.map(strategy => this.toParsedGovPowerStrategy(strategy)),
    };
  }

  /**
   * Parse a raw round award query result by splitting the award amount if needed
   * @param winnerCount The round winner count
   * @param awards The awards to parse
   */
  protected toParsedAwards(winnerCount: number, awards: RoundAward[]): RoundAward[] {
    if (awards.length === 1 && winnerCount > 1) {
      const [award] = awards;
      const amount = (BigInt(award.amount) / BigInt(winnerCount)).toString();
      return Array(winnerCount).fill({
        asset: award.asset,
        amount,
      });
    }
    return awards;
  }

  /**
   * Parse a raw governance power strategy query result
   * @param strategy The strategy to parse
   */
  protected toParsedGovPowerStrategy(strategy: {
    __typename?: 'GovPowerStrategy';
    id: string;
    type: string;
    address: string;
    params: Array<string | number>;
  }): ParsedGovPowerStrategy {
    switch (strategy.type) {
      case GovPowerStrategyType.BALANCE_OF: {
        const [address, _, multiplier] = strategy.params;
        return {
          id: strategy.id,
          strategyType: GovPowerStrategyType.BALANCE_OF,
          tokenAddress: `0x${BigInt(address).toString(16)}`,
          ...(multiplier ? { multiplier: Number(multiplier) } : {}),
        };
      };
      case GovPowerStrategyType.BALANCE_OF_ERC1155: {
        const [address, tokenId, _, multiplier] = strategy.params;
        return {
          id: strategy.id,
          strategyType: GovPowerStrategyType.BALANCE_OF_ERC1155,
          tokenAddress: `0x${BigInt(address).toString(16)}`,
          tokenId: tokenId.toString(),
          ...(multiplier ? { multiplier: Number(multiplier) } : {}),
        };
      };
      case GovPowerStrategyType.ALLOWLIST: {
        return {
          id: strategy.id,
          strategyType: GovPowerStrategyType.ALLOWLIST,
          members: [], // TODO
        };
      };
      case GovPowerStrategyType.VANILLA: {
        return {
          id: strategy.id,
          strategyType: GovPowerStrategyType.VANILLA,
        };
      };
      default: {
        return {
          id: strategy.id,
          strategyType: GovPowerStrategyType.UNKNOWN,
          address: strategy.address,
          params: strategy.params,
        };
      };
    }
  }

  /**
   * Convert a raw proposal query result to a proposal object
   * @param proposal The proposal to convert
   */
  protected toProposal(proposal: IProposalQuery['proposal']): Proposal {
    if (!proposal) throw new Error('Proposal information not present during attempted conversion');
    return {
      id: proposal.proposalId,
      proposer: proposal.proposer.id,
      round: proposal.round.sourceChainRound,
      metadataURI: proposal.metadataUri,
      title: proposal.title,
      body: proposal.body,
      isCancelled: proposal.isCancelled,
      isWinner: proposal.isWinner,
      receivedAt: proposal.receivedAt,
      txHash: proposal.txHash,
      votingPower: proposal.votingPower,
    };
  }

  /**
   * Convert a raw round w/ house query result to a round w/ house object
   * @param round The round to convert
   */
  protected toRoundWithHouseInfo(round: IRoundWithHouseInfoQuery['round']): RoundWithHouse {
    if (!round) throw new Error('Round information not present during attempted conversion');
    return {
      ...this.toRound(round),
      house: this.toHouse(round.house),
    };
  }

  /**
   * Merge a user and a default configuration
   * @param defaultConfig The default configuration
   * @param userConfig The user-provided partial configuration
   */
  protected merge<OB, W>(
    defaultConfig: QueryConfig<OB, W>,
    userConfig: Partial<QueryConfig<OB, W>>,
  ) {
    return {
      ...defaultConfig,
      ...userConfig,
    };
  }
}
