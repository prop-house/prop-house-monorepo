import { Custom, Newable, VotingStrategyInfo, VotingStrategyType } from '../types';
import { BalanceOfVotingStrategy } from './balance-of';
import { VanillaVotingStrategy } from './vanilla';
import { WhitelistVotingStrategy } from './whitelist';
import { VotingStrategyBase } from './base';

export class Voting<CVS extends Custom | void = void> {
  private readonly _strategies: Map<string, VotingStrategyBase<VotingStrategyInfo<CVS>>>;

  constructor(
    chainId: number,
    customStrategies: Newable<VotingStrategyBase<VotingStrategyInfo<CVS>>>[] = [],
  ) {
    this._strategies = new Map<string, VotingStrategyBase<VotingStrategyInfo<CVS>>>([
      [VotingStrategyType.BALANCE_OF, BalanceOfVotingStrategy.for(chainId)],
      [VotingStrategyType.VANILLA, VanillaVotingStrategy.for(chainId)],
      [VotingStrategyType.WHITELIST, WhitelistVotingStrategy.for(chainId)],
      ...customStrategies.map<[string, VotingStrategyBase<VotingStrategyInfo<CVS>>]>(
        CustomStrategy => {
          const strategy = new CustomStrategy(chainId);
          return [strategy.type, strategy];
        },
      ),
    ]);
  }

  /**
   * Returns a `Voting` instance for the provided chain ID
   * @param chainId The chain ID
   * @param customStrategies Optional custom voting strategies
   */
  public static for<CVS extends Custom | void = void>(
    chainId: number,
    customStrategies: Newable<VotingStrategyBase<VotingStrategyInfo<CVS>>>[] = [],
  ) {
    return new Voting<CVS>(chainId, customStrategies);
  }

  /**
   * Voting strategy helper contracts
   */
  public get strategies() {
    return this._strategies;
  }

  /**
   * @notice Get the address and low-level parameter information for the provided voting strategy
   * @param strategy The strategy information
   */
  public async getStarknetStrategy(strategy: VotingStrategyInfo<CVS>) {
    if (!this.strategies.has(strategy.strategyType)) {
      throw new Error(`Unknown voting strategy type: ${strategy.strategyType}`);
    }
    return this.strategies.get(strategy.strategyType)!.getStarknetStrategy(strategy);
  }
}
