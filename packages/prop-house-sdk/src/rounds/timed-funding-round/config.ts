import { defaultAbiCoder } from '@ethersproject/abi';
import { BigNumber } from '@ethersproject/bignumber';
import { AssetType, TimedFundingRoundConfig } from '../../types';
import { encoding } from '../../utils';
import {
  MAX_WINNER_COUNT,
  MIN_PROPOSAL_PERIOD_DURATION,
  MIN_VOTE_PERIOD_DURATION,
  TIMED_FUNDING_ROUND_CONFIG_STRUCT_TYPE,
} from './constants';

/**
 * ABI-encode the timed funding round configuration
 * @param config The timed funding round config
 */
export const encodeTimedFundingRoundConfig = (config: TimedFundingRoundConfig): string => {
  const now = Math.floor(Date.now() / 1000);

  if (config.proposalPeriodDuration < MIN_PROPOSAL_PERIOD_DURATION) {
    throw new Error('Proposal period duration is too short');
  }
  if (config.proposalPeriodStartTimestamp < now) {
    throw new Error('Proposal period start timestamp is in the past');
  }
  if (config.votePeriodDuration < MIN_VOTE_PERIOD_DURATION) {
    throw new Error('Vote period duration is too short');
  }
  if (config.winnerCount == 0) {
    throw new Error('Round must have at least one winner');
  }
  if (config.winnerCount > MAX_WINNER_COUNT) {
    throw new Error(
      `Winner count too high. Maximum winners: ${MAX_WINNER_COUNT}. Got: ${config.winnerCount}.`,
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
    if (!BigNumber.from(config.awards[0].amount).mod(config.winnerCount).eq(0)) {
      throw new Error(`Award must split equally between winners`);
    }
  }
  if (config.strategies.length == 0) {
    throw new Error('Round must have at least one voting strategy');
  }

  // TODO: Need to convert strategies to addresses with params and

  if (config.strategies.some(s => s.strategyType)) {
    // TODO: some BigNumber.from(address).eq(0)
  }

  return defaultAbiCoder.encode(
    [TIMED_FUNDING_ROUND_CONFIG_STRUCT_TYPE],
    [
      [
        encoding.compressAssets(config.awards),
        // TODO: Voting Strategies Array
        config.proposalPeriodStartTimestamp,
        config.proposalPeriodDuration,
        config.votePeriodDuration,
        config.winnerCount,
      ],
    ],
  );
};
