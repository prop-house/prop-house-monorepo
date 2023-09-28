import { Maybe } from 'graphql/jsutils/Maybe';
import { RoundType, Timed, GovPowerStrategyType, AllowlistMember, GovPowerStrategyWithID } from '../types';

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

export interface RawGovPowerStrategy extends GovPowerStrategyWithID {
  type: string;
}

export interface BalanceOfStrategy {
  id: string;
  strategyType: GovPowerStrategyType.BALANCE_OF;
  tokenAddress: string;
  multiplier?: number;
}

export interface ERC1155BalanceOfStrategy {
  id: string;
  strategyType: GovPowerStrategyType.ERC1155_BALANCE_OF;
  tokenAddress: string;
  tokenId: string;
  multiplier?: number;
}

export interface AllowlistStrategy {
  id: string;
  strategyType: GovPowerStrategyType.ALLOWLIST;
  members: AllowlistMember[];
}

export interface VanillaStrategy {
  id: string;
  strategyType: GovPowerStrategyType.VANILLA;
}

export interface UnknownStrategy extends GovPowerStrategyWithID {
  strategyType: GovPowerStrategyType.UNKNOWN;
}

export type ParsedGovPowerStrategy = BalanceOfStrategy | ERC1155BalanceOfStrategy | AllowlistStrategy | VanillaStrategy | UnknownStrategy;

export type ProposingStrategy = ParsedGovPowerStrategy;
export type VotingStrategy = ParsedGovPowerStrategy;

export interface RoundAsset {
  assetType: 'NATIVE' | 'ERC20' | 'ERC721' | 'ERC1155';
  token: string;
  identifier: string;
}

export interface RoundAward {
  amount: string;
  asset: RoundAsset;
}

export interface TimedRoundConfig {
  winnerCount: number;
  proposalThreshold: number;
  proposalPeriodStartTimestamp: number;
  proposalPeriodEndTimestamp: number;
  proposalPeriodDuration: number;
  votePeriodStartTimestamp: number;
  votePeriodEndTimestamp: number;
  votePeriodDuration: number;
  claimPeriodEndTimestamp: number;
  awards: RoundAward[];
}

export type RoundConfig = TimedRoundConfig;

export type RoundState = Timed.RoundState

export interface Round {
  address: string;
  type: RoundType;
  title: string;
  description: string;
  createdAt: number;
  state: RoundState;
  config: RoundConfig;
  proposingStrategiesRaw: RawGovPowerStrategy[];
  votingStrategiesRaw: RawGovPowerStrategy[];
  proposingStrategies: ProposingStrategy[];
  votingStrategies: VotingStrategy[];
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
