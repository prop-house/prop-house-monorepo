import {
  Custom,
  GovPowerChainConfig,
  GovPowerStrategy,
  GovPowerStrategyConfig,
  GovPowerStrategyWithID,
} from '../types';
import { BigNumber } from '@ethersproject/bignumber';
import { hexStripZeros } from '@ethersproject/bytes';
import { Call } from 'starknet';
import {
  BalanceOfHandler,
  VanillaHandler,
  AllowlistHandler,
  StrategyHandlerBase,
} from './handlers';

export class GovPowerManager<CS extends Custom | void = void> {
  private readonly _defaults = [BalanceOfHandler, VanillaHandler, AllowlistHandler];
  private readonly _all: StrategyHandlerBase<GovPowerStrategyConfig<CS>>[];

  constructor(private readonly _config: GovPowerChainConfig<CS>) {
    this._all = [...this._defaults, ...(this._config.customStrategies || [])].map(
      Handler => new Handler(this._config) as StrategyHandlerBase<GovPowerStrategyConfig<CS>>,
    );
  }

  /**
   * Returns a `GovPowerManager` instance for the provided chain configuration
   * @param config The prop house governance power config
   */
  public static for<CS extends Custom | void = void>(config: GovPowerChainConfig<CS>) {
    return new GovPowerManager<CS>(config);
  }

  /**
   * Get a governance power utility class instance
   * @param typeOrAddress The governance power strategy type or address
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
      throw new Error(`Unknown governance power strategy type or address: ${typeOrAddress}`);
    }
    return strategy;
  }

  /**
   * @notice Get the address and parameter information for the provided governance power strategy
   * @param strategy The strategy information
   */
  public async getStrategyAddressAndParams(strategy: GovPowerStrategyConfig<CS>) {
    const util = this.get(strategy.strategyType)!;
    return {
      address: util?.address,
      params: await util.getStrategyParams(strategy),
    };
  }

  public async getUserParamsForStrategies(
    account: string,
    timestamp: string,
    strategies: GovPowerStrategyWithID[],
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
    strategies: GovPowerStrategyWithID[],
  ): Promise<Call[]> {
    const preCalls = await Promise.all(
      strategies.map(async strategy =>
        this.get(strategy.address).getStrategyPreCalls?.(account, timestamp, strategy.id),
      ),
    );
    return preCalls.flat().filter(call => call !== undefined) as Call[];
  }

  public async getPowerForStrategies<GPS extends GovPowerStrategy>(
    user: string,
    timestamp: string | number,
    strategies: GPS[],
    filterZeroGovPower = true,
  ) {
    const results = await Promise.all(
      strategies.map(async strategy => {
        const handler = this.get(strategy.address)!;
        return {
          strategy: {
            ...strategy,
            address: handler.address,
          },
          govPower: await handler.getPower({
            ...strategy,
            address: handler.address,
            user,
            timestamp,
          }),
        };
      }),
    );
    if (filterZeroGovPower) {
      return results.filter(({ govPower }) => !govPower.eq(0));
    }
    return results;
  }

  public async getTotalPower(
    user: string,
    timestamp: string | number,
    strategies: GovPowerStrategy[],
  ) {
    const results = await this.getPowerForStrategies(user, timestamp, strategies);
    return results.reduce((acc, curr) => acc.add(curr.govPower), BigNumber.from(0));
  }
}
