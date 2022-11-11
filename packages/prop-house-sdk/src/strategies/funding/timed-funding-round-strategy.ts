import { TimedFundingRoundStrategy } from './types';
import { BigNumber } from '@ethersproject/bignumber';
import { defaultAbiCoder } from '@ethersproject/abi';
import { AssetType, Award } from '../../houses';
import { Time, TimeUnit } from 'time-ts';

/**
 * The `TimedFundingRound` struct type
 */
export const TIMED_FUNDING_ROUND_STRUCT_TYPE = 'tuple(uint40,uint40,uint40,uint16)';

/**
 * The minimum time required between round initiation and the start of the proposal period
 */
export const MIN_TIME_UNTIL_PROPOSAL_PERIOD = Time.toSeconds(2, TimeUnit.Hours);

/**
 * The minimum proposal submission period duration
 */
export const MIN_PROPOSAL_PERIOD_DURATION = Time.toSeconds(4, TimeUnit.Hours);

/**
 * The minimum vote period duration
 */
export const MIN_VOTE_PERIOD_DURATION = Time.toSeconds(4, TimeUnit.Hours);

/**
 * Maximum winner count for this strategy
 */
export const MAX_WINNER_COUNT = 256;

/**
 * Get the validator and encoded config information for the timed funding round house strategy
 * @param strategy The timed funding round config
 * @param awards The funding round awards
 */
export const getTimedFundingRoundInfo = (strategy: TimedFundingRoundStrategy, awards: Award[]) => {
  const now = Math.floor(Date.now() / 1000);

  const { config } = strategy;
  if (config.proposalPeriodStartTimestamp - MIN_TIME_UNTIL_PROPOSAL_PERIOD < now) {
    throw new Error(`Proposal period start timestamp is too soon`);
  }
  if (config.proposalPeriodDuration < MIN_PROPOSAL_PERIOD_DURATION) {
    throw new Error(`Proposal period duration too short`);
  }
  if (config.votePeriodDuration < MIN_VOTE_PERIOD_DURATION) {
    throw new Error(`Vote period duration too short`);
  }
  if (awards.length !== 1 && awards.length !== config.winnerCount) {
    throw new Error(
      `Must specify a single award asset or one asset per winner. Winners: ${config.winnerCount}. Awards: ${awards.length}.`,
    );
  }
  if (awards.length === 1 && config.winnerCount > 1) {
    if (awards[0].assetType === AssetType.ERC721) {
      throw new Error(`Cannot split ERC721 between multiple winners`);
    }
    if (BigNumber.from(awards[0].amount).toNumber() % config.winnerCount !== 0) {
      throw new Error(`Award must split equally between winners`);
    }
  }
  if (config.winnerCount > MAX_WINNER_COUNT) {
    throw new Error(
      `Winner count too high. Maximum winners: ${MAX_WINNER_COUNT}. Got: ${config.winnerCount}.`,
    );
  }

  return {
    // prettier-ignore
    validator: strategy?.validator || (() => {
        throw new Error('`TimedFundingRound` validator does not exist for current chain');
    })(),
    config: defaultAbiCoder.encode(
      [TIMED_FUNDING_ROUND_STRUCT_TYPE],
      [
        config.proposalPeriodStartTimestamp,
        config.proposalPeriodDuration,
        config.votePeriodDuration,
        config.winnerCount,
      ],
    ),
  };
};
