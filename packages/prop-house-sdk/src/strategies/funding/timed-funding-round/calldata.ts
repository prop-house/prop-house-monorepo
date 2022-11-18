import { TimedFundingRoundStrategy } from '../types';
import { BigNumber, BigNumberish } from '@ethersproject/bignumber';
import { encoding, intsSequence, splitUint256 } from '../../../utils';
import { defaultAbiCoder } from '@ethersproject/abi';
import { AssetType, Award } from '../../../houses';
import { ProposalVote } from './types';
import {
  MIN_TIME_UNTIL_PROPOSAL_PERIOD,
  MIN_PROPOSAL_PERIOD_DURATION,
  MIN_VOTE_PERIOD_DURATION,
  MAX_WINNER_COUNT,
  TIMED_FUNDING_ROUND_STRUCT_TYPE,
} from './constants';

/**
 * Get the validator and encoded config information for the timed funding round house strategy
 * @param strategy The timed funding round config
 * @param awards The funding round awards
 */
export const getTimedFundingRoundCalldata = (
  strategy: TimedFundingRoundStrategy,
  awards: Award[],
) => {
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
    if (!BigNumber.from(awards[0].amount).mod(config.winnerCount).eq(0)) {
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
        [
          config.proposalPeriodStartTimestamp,
          config.proposalPeriodDuration,
          config.votePeriodDuration,
          config.winnerCount,
        ],
      ],
    ),
  };
};

/**
 * Generates a calldata array for creating a proposal through an authenticator
 * @param proposer The address of the proposal creator
 * @param metadataUri The URI address of the proposal
 */
export const getTimedFundingRoundProposeCalldata = (
  proposer: string,
  metadataUri: string,
): string[] => {
  const _metadataUri = intsSequence.IntsSequence.LEFromString(metadataUri);
  return [
    proposer,
    `0x${_metadataUri.bytesLength.toString(16)}`,
    `0x${_metadataUri.values.length.toString(16)}`,
    ..._metadataUri.values,
  ];
};

/**
 * Generates a calldata array for cancelling a proposal through an authenticator
 * @param proposer The address of the proposal creator
 * @param proposalId The ID of the proposal to cancel
 */
export const getTimedFundingRoundCancelProposalCalldata = (
  proposer: string,
  proposalId: BigNumberish,
): string[] => {
  return [proposer, BigNumber.from(proposalId).toHexString()];
};

/**
 * Generates a calldata array for casting a vote through an authenticator
 * @param voterAddress The address of the proposal creator
 * @param proposalVotes The proposal IDs and voting power
 * @param usedVotingStrategies The array of the used voting strategy indexes
 * @param usedVotingStrategyParams The array of arrays containing the parameters corresponding to the used voting strategies
 */
export const getTimedFundingRoundVoteCalldata = (
  voterAddress: string,
  proposalVotes: ProposalVote[],
  usedVotingStrategies: number[],
  usedVotingStrategyParams: string[][],
): string[] => {
  const flattenedUsedVotingStrategyParams = encoding.flatten2DArray(usedVotingStrategyParams);
  const flattenedProposalVotes = proposalVotes
    .map(vote => {
      const { low, high } = splitUint256.SplitUint256.fromUint(BigInt(vote.votingPower.toString()));
      return [
        `0x${vote.proposalId.toString(16)}`,
        BigNumber.from(low).toHexString(),
        BigNumber.from(high).toHexString(),
      ];
    })
    .flat();
  return [
    voterAddress,
    `0x${proposalVotes.length.toString(16)}`,
    ...flattenedProposalVotes,
    `0x${usedVotingStrategies.length.toString(16)}`,
    ...usedVotingStrategies.map(strategy => `0x${strategy.toString(16)}`),
    `0x${flattenedUsedVotingStrategyParams.length.toString(16)}`,
    ...flattenedUsedVotingStrategyParams,
  ];
};
