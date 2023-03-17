import {
  Custom,
  VotingChainConfig,
  VotingStrategy,
  VotingStrategyConfig,
  VotingStrategyWithID,
} from '../types';
import { BigNumber } from '@ethersproject/bignumber';
import {
  BalanceOfHandler,
  VanillaHandler,
  WhitelistHandler,
  StrategyHandlerBase,
} from './handlers';

export class Voting<CS extends Custom | void = void> {
  private readonly _defaults = [BalanceOfHandler, VanillaHandler, WhitelistHandler];
  private readonly _all: StrategyHandlerBase<VotingStrategyConfig<CS>>[];

  constructor(private readonly _config: VotingChainConfig<CS>) {
    this._all = [...this._defaults, ...(this._config.customStrategies || [])].map(
      Handler => new Handler(this._config) as StrategyHandlerBase<VotingStrategyConfig<CS>>,
    );
  }

  /**
   * Returns a `Voting` instance for the provided chain configuration
   * @param config The prop house voting config
   */
  public static for<CS extends Custom | void = void>(config: VotingChainConfig<CS>) {
    return new Voting<CS>(config);
  }

  /**
   * Get a voting utility class instance
   * @param typeOrAddress The voting strategy type or address
   */
  public get(typeOrAddress: string) {
    const strategy = this._all.find(s =>
      [s.type, s.address.toLowerCase()].includes(typeOrAddress.toLowerCase()),
    );
    if (!strategy) {
      throw new Error(`Unknown voting strategy type or address: ${typeOrAddress}`);
    }
    return strategy;
  }

  /**
   * @notice Get the address and parameter information for the provided voting strategy
   * @param strategy The strategy information
   */
  public async getStrategyAddressAndParams(strategy: VotingStrategyConfig<CS>) {
    const util = this.get(strategy.strategyType)!;
    return {
      address: util?.address,
      params: await util.getStrategyParams(strategy),
    };
  }

  public async getUserParamsForStrategies(
    account: string,
    timestamp: string,
    strategies: VotingStrategyWithID[],
  ): Promise<string[][]> {
    return Promise.all(
      strategies.map(async strategy =>
        this.get(strategy.address).getUserParams(account, timestamp, strategy.id),
      ),
    );
  }

  public async getVotingPowerForStrategies<VS extends VotingStrategy>(
    voter: string,
    timestamp: string,
    strategies: VS[],
    filterZeroVotingPower = true,
  ) {
    const results = await Promise.all(
      strategies.map(async strategy => {
        return {
          strategy,
          votingPower: await this.get(strategy.address).getVotingPower({
            ...strategy,
            voter,
            timestamp,
          }),
        };
      }),
    );
    if (filterZeroVotingPower) {
      return results.filter(({ votingPower }) => !votingPower.eq(0));
    }
    return results;
  }

  public async getTotalVotingPower(voter: string, timestamp: string, strategies: VotingStrategy[]) {
    const results = await this.getVotingPowerForStrategies(voter, timestamp, strategies);
    return results.reduce((acc, curr) => acc.add(curr.votingPower), BigNumber.from(0));
  }
}
