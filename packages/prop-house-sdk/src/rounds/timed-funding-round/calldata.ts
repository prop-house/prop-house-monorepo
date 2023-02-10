import { BigNumber, BigNumberish } from '@ethersproject/bignumber';
import { encoding, intsSequence, splitUint256 } from '../../utils';
import { ProposalVote } from './types';

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
 * @param voterAddress The address of the voter
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
