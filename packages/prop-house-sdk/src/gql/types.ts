import { Maybe } from 'graphql/jsutils/Maybe';
import { RoundType, Timed, GovPowerStrategyType, AllowlistMember, GovPowerStrategyWithID, Asset } from '../types';

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

export interface BalanceOfERC20Strategy {
  id: string;
  strategyType: GovPowerStrategyType.BALANCE_OF_ERC20;
  tokenAddress: string;
  multiplier?: number;
}

export interface BalanceOfERC1155Strategy {
  id: string;
  strategyType: GovPowerStrategyType.BALANCE_OF_ERC1155;
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

export type ParsedGovPowerStrategy = BalanceOfStrategy | BalanceOfERC20Strategy | BalanceOfERC1155Strategy | AllowlistStrategy | VanillaStrategy | UnknownStrategy;

export type ProposingStrategy = ParsedGovPowerStrategy;
export type VotingStrategy = ParsedGovPowerStrategy;

export interface RawRoundAsset {
  assetType: 'NATIVE' | 'ERC20' | 'ERC721' | 'ERC1155';
  token: string;
  identifier: string;
}

export interface RawRoundAward {
  amount: string;
  asset: RawRoundAsset;
}

export interface RawRoundBalance {
  balance: string;
  asset: RawRoundAsset;
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
  awards: Asset[];
}

export type RoundConfig = TimedRoundConfig;

export type RoundState = Timed.RoundState;

export interface Round {
  address: string;
  type: RoundType;
  title: string;
  description: string;
  createdAt: number;
  state: RoundState;
  config: RoundConfig;
  isFullyFunded: boolean;
  proposingStrategiesRaw: RawGovPowerStrategy[];
  votingStrategiesRaw: RawGovPowerStrategy[];
  proposingStrategies: ProposingStrategy[];
  votingStrategies: VotingStrategy[];
}

export interface RoundWithHouse extends Round {
  house: House;
}

export interface RoundBalance {
  round: string;
  asset: Asset;
  updatedAt: string;
}

export interface Proposal {
  id: number;
  proposer: string;
  round: string;
  metadataURI: string;
  title: string;
  tldr: string;
  body: string;
  isCancelled: boolean;
  isWinner: boolean;
  winningPosition: number | null;
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

export interface Deposit {
  id: string;
  txHash: string;
  depositedAt: string;
  depositor: string;
  round: string;
  asset: Asset;
}

export interface Claim {
  id: string;
  txHash: string;
  claimedAt: string;
  recipient: string;
  proposalId: string;
  round: string;
  asset: Asset;
}
