import { defaultAbiCoder } from '@ethersproject/abi';
import { BigNumber } from '@ethersproject/bignumber';
import { AssetType, RoundType, TimedFundingRoundConfig } from '../types';
import { Time, TimeUnit } from 'time-ts';
import { encoding } from '../utils';
import { Voting } from '../voting';
import { RoundBase } from './base';

export class TimedFundingRound extends RoundBase<RoundType.TIMED_FUNDING> {
  /**
   * The `RoundConfig` struct type
   */
  // prettier-ignore
  public static CONFIG_STRUCT_TYPE = 'tuple(tuple(uint8,address,uint256,uint256)[],uint256[],uint256[],uint40,uint40,uint40,uint16)';

  /**
   * The minimum proposal submission period duration
   */
  public static MIN_PROPOSAL_PERIOD_DURATION = Time.toSeconds(1, TimeUnit.Days);

  /**
   * The minimum vote period duration
   */
  public static MIN_VOTE_PERIOD_DURATION = Time.toSeconds(1, TimeUnit.Days);

  /**
   * Maximum winner count for this strategy
   */
  public static MAX_WINNER_COUNT = 256;

  /**
   * Returns a `TimedFundingRound` instance for the provided chain ID
   * @param chainId
   */
  public static for(chainId: number) {
    return new TimedFundingRound(chainId);
  }

  /**
   * The round type
   */
  public get type() {
    return RoundType.TIMED_FUNDING;
  }

  /**
   * The round implementation contract address
   */
  public get impl() {
    return this._impls.timedFunding;
  }

  /**
   * ABI-encode the timed funding round configuration
   * @param config The timed funding round config
   */
  public async getABIEncodedConfig(config: TimedFundingRoundConfig): Promise<string> {
    const now = Math.floor(Date.now() / 1000);

    // prettier-ignore
    if (config.proposalPeriodStartTimestamp + config.proposalPeriodDuration < now + TimedFundingRound.MIN_PROPOSAL_PERIOD_DURATION) {
      throw new Error('Remaining proposal period duration is too short');
    }
    if (config.votePeriodDuration < TimedFundingRound.MIN_VOTE_PERIOD_DURATION) {
      throw new Error('Vote period duration is too short');
    }
    if (config.winnerCount == 0) {
      throw new Error('Round must have at least one winner');
    }
    if (config.winnerCount > TimedFundingRound.MAX_WINNER_COUNT) {
      throw new Error(
        `Winner count too high. Maximum winners: ${TimedFundingRound.MAX_WINNER_COUNT}. Got: ${config.winnerCount}.`,
      );
    }
    if (config.awards.length !== 1 && config.awards.length !== config.winnerCount) {
      throw new Error(
        `Must specify a single award asset to split or one asset per winner. Winners: ${config.winnerCount}. Awards: ${config.awards.length}.`,
      );
    }
    if (config.awards.length === 1 && config.winnerCount > 1) {
      if (config.awards[0].assetType === AssetType.ERC721) {
        throw new Error(`Cannot split ERC721 between multiple winners`);
      }
      // prettier-ignore
      if (!BigNumber.from(config.awards[0].amount).mod(config.winnerCount).eq(0)) {
        throw new Error(`Award must split equally between winners`);
      }
    }
    if (config.strategies.length == 0) {
      throw new Error('Round must have at least one voting strategy');
    }
    const strategies = await Promise.all(
      config.strategies.map(s => Voting.for(this._chainId).getStarknetStrategy(s)),
    );

    return defaultAbiCoder.encode(
      [TimedFundingRound.CONFIG_STRUCT_TYPE],
      [
        [
          config.awards.map(award => {
            const struct = encoding.getAssetStruct(award);
            return [struct.assetType, struct.token, struct.identifier, struct.amount];
          }),
          strategies.map(s => s.addr),
          encoding.flatten2DArray(strategies.map(s => s.params.map(p => p.toString()))),
          config.proposalPeriodStartTimestamp,
          config.proposalPeriodDuration,
          config.votePeriodDuration,
          config.winnerCount,
        ],
      ],
    );
  }
}
