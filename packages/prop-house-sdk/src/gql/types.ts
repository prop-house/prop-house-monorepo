import { Maybe } from 'graphql/jsutils/Maybe';
import { RoundState, RoundType, VotingStrategy } from '../types';

export interface GlobalStats {
  roundCount: number;
  proposalCount: number;
  uniqueProposers: number;
  uniqueVoters: number;
}

export interface House {
  address: string;
  name?: string;
  description?: string;
  imageURI?: string;
  createdAt: number;
  roundCount: number;
  owner: Maybe<string>;
  roundCreators: RoundCreator[];
}

export interface RoundCreator {
  account: string;
  passCount: number;
}

export interface RoundVotingStrategy extends VotingStrategy {
  id: string;
  type: string;
}

export interface RoundAsset {
  assetType: 'NATIVE' | 'ERC20' | 'ERC721' | 'ERC1155';
  token: string;
  identifier: string;
}

export interface RoundAward {
  amount: string;
  asset: RoundAsset;
}

export interface TimedFundingRoundConfig {
  winnerCount: number;
  proposalPeriodStartTimestamp: number;
  proposalPeriodEndTimestamp: number;
  proposalPeriodDuration: number;
  votePeriodStartTimestamp: number;
  votePeriodEndTimestamp: number;
  votePeriodDuration: number;
  claimPeriodEndTimestamp: number;
  awards: RoundAward[];
}

export type RoundConfig = TimedFundingRoundConfig;

export interface Round {
  address: string;
  type: RoundType;
  title: string;
  description: string;
  createdAt: number;
  state: RoundState;
  config: RoundConfig;
  votingStrategies: RoundVotingStrategy[];
}

export interface RoundWithHouse extends Round {
  house: House;
}

export interface Proposal {
  id: number;
  proposer: string;
  round: string;
  metadataURI: string;
  title: string;
  body: string;
  isCancelled: boolean;
  isWinner: boolean;
  receivedAt: number;
  txHash: string;
  votingPower: string;
}

export interface Vote {
  voter: string;
  round: string;
  proposalId: number;
  votingPower: string;
  receivedAt: number;
  txHash: string;
}

// TODO: Populate deposit and claim types

export interface Deposit {}

export interface Claim {}
