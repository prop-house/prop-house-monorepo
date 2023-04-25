import { GraphQLClient } from 'graphql-request';
import {
  Balance_OrderBy,
  Claim_OrderBy,
  Deposit_OrderBy,
  House_OrderBy,
  Round_OrderBy,
  VotingStrategy_OrderBy,
  RoundQuery as IRoundQuery,
  RoundWithHouseInfoQuery as IRoundWithHouseInfoQuery,
  HouseQuery as IHouseQuery,
  House_Filter,
  Round_Filter,
  Balance_Filter,
  VotingStrategy_Filter,
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
  ManyVotingStrategiesQuery,
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
  WhereProposal,
  WhereVote,
} from './starknet/graphql';
import { Address, GraphQL, RoundType } from '../types';
import {
  GlobalStats,
  House,
  Proposal,
  Round,
  RoundAward,
  RoundConfig,
  RoundWithHouse,
  Vote,
} from './types';
import {
  GlobalStatsQuery,
  ManyProposalsQuery,
  ManyRoundProposalsQuery,
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
   * Get voting strategy information
   * @param config Filtering, pagination, and ordering configuration
   */
  public async getVotingStrategies(
    config: Partial<QueryConfig<VotingStrategy_OrderBy, VotingStrategy_Filter>> = {},
  ) {
    return this._gql.evm.request(
      ManyVotingStrategiesQuery,
      toPaginated(this.merge(getDefaultConfig(VotingStrategy_OrderBy.Id), config)),
    );
  }

  /**
   * Get voting strategy information for a single round
   * @param roundAddress The round address
   * @param config Filtering, pagination, and ordering configuration
   */
  public async getRoundVotingStrategies(
    roundAddress: Address,
    config: Partial<QueryConfig<VotingStrategy_OrderBy, VotingStrategy_Filter>> = {},
  ) {
    return this.getVotingStrategies({
      ...config,
      where: {
        ...config.where,
        rounds_: { round: roundAddress.toLowerCase() },
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
    config: Partial<QueryConfig<OrderByProposalFields, WhereProposal>> = {},
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
    config: Partial<QueryConfig<OrderByProposalFields, WhereProposal>> = {},
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
    config: Partial<QueryConfig<OrderByProposalFields, WhereProposal>> = {},
  ) {
    const { rounds } = await this._gql.starknet.request(ManyRoundProposalsQuery, {
      ...toPaginated(this.merge(getDefaultConfig(OrderByProposalFields.ReceivedAt), config)),
      where: {
        ...config.where,
        sourceChainRound: roundAddress.toLowerCase(),
      },
    });
    if (!rounds?.length) {
      throw new Error(`No round found for address ${roundAddress}`);
    }
    return (
      rounds?.[0]?.proposals!.map(p => ({
        id: p!.proposalId,
        proposer: p!.proposer.id,
        round: roundAddress.toLowerCase(),
        metadataURI: p!.metadataUri,
        title: p!.title,
        body: p!.body,
        isCancelled: p!.isCancelled,
        isWinner: p!.isWinner,
        receivedAt: p!.receivedAt,
        txHash: p!.txHash,
        votingPower: p!.votingPower,
      })) ?? []
    );
  }

  /**
   * Fetch a proposal using the provided round address and proposal id
   * @param roundAddress The round address
   * @param proposalId The proposal id
   */
  public async getProposal(roundAddress: string, proposalId: number): Promise<Proposal> {
    const { proposal } = await this._gql.starknet.request(ProposalQuery, {
      id: `${roundAddress}-${proposalId}`.toLowerCase(),
    });
    if (!proposal) {
      throw new Error(`Proposal ID ${proposalId} not found for round ${roundAddress}`);
    }
    return this.toProposal(proposal);
  }

  /**
   * Get paginated votes
   * @param config Filtering, pagination, and ordering configuration
   */
  public async getVotes(
    config: Partial<QueryConfig<OrderByVoteFields, WhereVote>> = {},
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
   * Get paginated votes by the provided voter address
   * @param voterAddress The voter address
   * @param config Filtering, pagination, and ordering configuration
   */
  public async getVotesByAccount(
    voterAddress: Address,
    config: Partial<QueryConfig<OrderByVoteFields, WhereVote>> = {},
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
    if (!round.timedFundingConfig)
      throw new Error('Round config information not present during attempted conversion');

    const config = round.timedFundingConfig;
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
        proposalPeriodStartTimestamp: Number(config.proposalPeriodStartTimestamp),
        proposalPeriodEndTimestamp: Number(config.proposalPeriodEndTimestamp),
        proposalPeriodDuration: Number(config.proposalPeriodDuration),
        votePeriodStartTimestamp: Number(config.votePeriodStartTimestamp),
        votePeriodEndTimestamp: Number(config.votePeriodEndTimestamp),
        votePeriodDuration: Number(config.votePeriodDuration),
        claimPeriodEndTimestamp: Number(config.claimPeriodEndTimestamp),
      },
      votingStrategies: round.votingStrategies.map(({ votingStrategy }) => votingStrategy),
    };
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
