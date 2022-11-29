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
  salt: string | number;
}

export interface EthSigVoteMessage {
  houseStrategy: string;
  authStrategy: string;
  voterAddress: string;
  proposalVotesHash: string;
  votingStrategiesHash: string;
  votingStrategyParamsHash: string;
  salt: string | number;
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

export interface TimedFundingRoundEthSigClientConfig extends ClientConfig {
  starknetRelayerUrl: string;
  votingStrategies?: Record<string, VotingStrategy<TimedFundingRoundEnvelope>>;
}

export interface TimedFundingRoundStarknetTxClientConfig extends ClientConfig {
  authStrategies?: Record<string, TimedFundingRoundAuthStrategy>;
  votingStrategies?: Record<string, VotingStrategy<TimedFundingRoundEnvelope>>;
}
