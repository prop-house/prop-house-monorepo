import {
  Custom,
  VotingChainConfig,
  VotingStrategy,
  VotingStrategyConfig,
  VotingStrategyWithID,
} from '../types';
import { BigNumber } from '@ethersproject/bignumber';
import { hexStripZeros } from '@ethersproject/bytes';
import { Call } from 'starknet';
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
    const strategy = this._all.find(s => {
      const address = BigNumber.from(s.address);
      const hexAddress = address.toHexString();
      const searchVariations = [
        s.type,
        hexAddress,
        hexStripZeros(hexAddress),
        address.toString(),
      ].map(s => s.toLowerCase());
      return searchVariations.includes(typeOrAddress.toLowerCase());
    });
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

  public async getPreCallsForStrategies(
    account: string,
    timestamp: string,
    strategies: VotingStrategyWithID[],
  ): Promise<Call[]> {
    const preCalls = await Promise.all(
      strategies.map(async strategy =>
        this.get(strategy.address).getStrategyPreCalls?.(account, timestamp, strategy.id),
      ),
    );
    return preCalls.flat().filter(call => call !== undefined) as Call[];
  }

  public async getVotingPowerForStrategies<VS extends VotingStrategy>(
    voter: string,
    timestamp: string | number,
    strategies: VS[],
    filterZeroVotingPower = true,
  ) {
    const results = await Promise.all(
      strategies.map(async strategy => {
        const handler = this.get(strategy.address)!;
        return {
          strategy: {
            ...strategy,
            address: handler.address,
          },
          votingPower: await handler.getVotingPower({
            ...strategy,
            address: handler.address,
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

  public async getTotalVotingPower(
    voter: string,
    timestamp: string | number,
    strategies: VotingStrategy[],
  ) {
    const results = await this.getVotingPowerForStrategies(voter, timestamp, strategies);
    return results.reduce((acc, curr) => acc.add(curr.votingPower), BigNumber.from(0));
  }
}
