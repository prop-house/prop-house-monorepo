import { BigNumberish } from '@ethersproject/bignumber';
import { AuthStrategy, ClientConfig, IEnvelope, VotingStrategy } from '../../types';

export interface TimedFundingRoundConfig {
  proposalPeriodStartTimestamp: number;
  proposalPeriodDuration: number;
  votePeriodDuration: number;
  winnerCount: number;
}

export interface ProposalVote {
  proposalId: number;
  votingPower: BigNumberish;
}

export interface ProposeMessage {
  houseStrategy: string;
  authStrategy: string;
  metadataUri: string;
}

export interface VoteMessage {
  houseStrategy: string;
  authStrategy: string;
  votingStrategies: number[];
  proposalVotes: ProposalVote[];
}

export interface EthSigProposeMessage extends ProposeMessage {
  proposerAddress: string;
  salt: number;
}

export interface EthSigVoteMessage extends VoteMessage {
  voterAddress: string;
  proposalVotesHash: string;
  usedVotingStrategiesHash: string;
  userVotingStrategyParamsFlatHash: string;
  salt: number;
}

export type TimedFundingRoundVanillaMessage = ProposeMessage | VoteMessage;

export type TimedFundingRoundSignatureMessage = EthSigProposeMessage | EthSigVoteMessage;

// prettier-ignore
export type TimedFundingRoundMessage = TimedFundingRoundVanillaMessage | TimedFundingRoundSignatureMessage;

export enum TimedFundingRoundAction {
  Propose = 'PROPOSE',
  Vote = 'VOTE',
}

export type TimedFundingRoundEnvelope<
  M extends TimedFundingRoundMessage = TimedFundingRoundMessage,
> = IEnvelope<M, TimedFundingRoundSignatureMessage, TimedFundingRoundAction>;

export type TimedFundingRoundAuthStrategy = AuthStrategy<
  TimedFundingRoundMessage,
  TimedFundingRoundSignatureMessage,
  TimedFundingRoundAction
>;

export interface TimedFundingRoundClientConfig extends ClientConfig {
  votingStrategyRegistry?: string;
  authStrategies?: Record<string, TimedFundingRoundAuthStrategy>;
  votingStrategies?: Record<string, VotingStrategy<TimedFundingRoundEnvelope>>;
}
