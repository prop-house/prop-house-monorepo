import { FundingHouse__factory, FundingHouseContract } from '@prophouse/contracts';
import { BaseContract, Overrides } from '@ethersproject/contracts';
import { FundingHouseBatcher } from './funding-house-batcher';
import { Signer } from '@ethersproject/abstract-signer';
import { getHouseStrategyCalldata } from '../../strategies';
import { Provider } from '@ethersproject/providers';
import { as, /* getAwardsCalldata */ } from './utils';
import { RoundConfig } from './types';

export class FundingHouse {
  private readonly _contract: FundingHouseContract;

  // TODO: Populate round configs on this class?

  /**
   * The funding house contract instance
   */
  public get contract() {
    return this._contract;
  }

  constructor(address: string, signerOrProvider: Signer | Provider) {
    this._contract = FundingHouse__factory.connect(address, signerOrProvider);
  }

  /**
   * Create a funding round that will be funded at a later time
   * @param config The round creation config
   * @param overrides Optional transaction overrides
   */
  public async createRound(config: RoundConfig, overrides: Overrides = {}) {    
    // strategy: PromiseOrValue<string>, voting: PromiseOrValue<BigNumberish>[], title: PromiseOrValue<string>, description: PromiseOrValue<string>, tags: PromiseOrValue<string>[]

    return this.contract.createRound(
      '',
      config.votingStrategyIds,
      config.title,
      config.description,
      config.tags,
      overrides,

      // config.strategy,
      // getHouseStrategyCalldata(config.strategy),
      

      // config.title,
      // config.description,
      // config.tags,
      // config.votingStrategyIds,
      // strategy
    );
    // return this.initiateRound(
    //   {
    //     title: round.title,
    //     description: round.description,
    //     tags: round.tags,
    //     votingStrategies: round.votingStrategies,
    //     strategy: getHouseStrategyCalldata(round.strategy, round.awards),
    //     awards: getAwardsCalldata(round.awards),
    //   },
    //   overrides,
    // );
  }

  /**
   * Create a funding round that will be funded at a later time
   * @param config The round creation config
   * @param overrides Optional transaction overrides
   */
  public async createAndFundRound(config: RoundConfig, overrides: Overrides = {}) {    
    // strategy: PromiseOrValue<string>, voting: PromiseOrValue<BigNumberish>[], title: PromiseOrValue<string>, description: PromiseOrValue<string>, tags: PromiseOrValue<string>[]

    return this.contract.createAndFundRound(
      '',
      '', // config
      config.votingStrategyIds,
      config.title,
      config.description,
      config.tags,
      [], // assets
      overrides,
    );
  }
}
