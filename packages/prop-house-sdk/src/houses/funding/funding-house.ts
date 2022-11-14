import { FundingHouse__factory, FundingHouseContract } from '@prophouse/contracts';
import { BaseContract, Overrides } from '@ethersproject/contracts';
import { FundingHouseBatcher } from './funding-house-batcher';
import { Signer } from '@ethersproject/abstract-signer';
import { getHouseStrategyCalldata } from '../../strategies';
import { Provider } from '@ethersproject/providers';
import { as, getAwardsCalldata } from './utils';
import { RoundParams } from './types';

export class FundingHouse extends as<BaseContract, FundingHouseContract>(BaseContract) {
  private readonly _batcher: FundingHouseBatcher;

  /**
   * A batcher used to execute many funding house function calls in a single transaction
   */
  public get batcher() {
    return this._batcher;
  }

  constructor(address: string, signerOrProvider: Signer | Provider) {
    super(address, FundingHouse__factory.abi, signerOrProvider);
    this._batcher = new FundingHouseBatcher(this);
  }

  /**
   * Initiate a funding round with more friendly parameters than the lower-level `initiateRound`
   * @param round The round initiation parameters
   * @param overrides Optional transaction overrides
   */
  public async initiateRoundSimple(round: RoundParams, overrides: Overrides = {}) {
    return this.initiateRound(
      {
        title: round.title,
        description: round.description,
        tags: round.tags,
        votingStrategies: round.votingStrategies,
        strategy: getHouseStrategyCalldata(round.strategy, round.awards),
        awards: getAwardsCalldata(round.awards),
      },
      overrides,
    );
  }
}
