import { AuthStrategy, ClientConfig, IEnvelope, VotingStrategy } from '../../../types';
import { BigNumberish } from '@ethersproject/bignumber';

export interface ProposalVote {
  proposalId: number;
  votingPower: BigNumberish;
}

export interface ProposeMessage {
  round: string;
  authStrategy: string;
  metadataUri: string;
}

export interface VoteMessage {
  round: string;
  authStrategy: string;
  votingStrategyIds: string[];
  proposalVotes: ProposalVote[];
}

export interface EthSigProposeMessage extends ProposeMessage {
  proposerAddress: string;
  salt: string | number;
}

export interface EthSigVoteMessage {
  round: string;
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
