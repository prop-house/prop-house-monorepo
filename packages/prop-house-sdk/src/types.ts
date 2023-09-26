import { CommunityHouseContract, InfiniteRoundContract, TimedRoundContract } from '@prophouse/protocol';
import { SequencerProvider, SequencerProviderOptions } from 'starknet';
import { BigNumberish } from '@ethersproject/bignumber';
import { Signer } from '@ethersproject/abstract-signer';
import { Provider } from '@ethersproject/providers';
import { StrategyHandlerBase, GovPowerManager } from './gov-power';
import { QueryWrapper } from './gql';

//#region Prop House

/**
 * EVM provider/connection information and optional signer
 */
export type EVM = Signer | Provider | string;

/**
 * Starknet connection information
 */
export type Starknet = SequencerProvider | SequencerProviderOptions;

export interface ChainConfig {
  evmChainId: number;
  evm: EVM;
  starknet?: Starknet;
}

export interface PropHouseConfig<CS extends Custom | void = void> extends ChainConfig {
  customStrategies?: Newable<StrategyHandlerBase<GovPowerStrategyConfig<CS>>>[];
  customStarknetRelayer?: string;
}

//#endregion

//#region Assets

export enum AssetType {
  ETH,
  ERC20,
  ERC721,
  ERC1155,
}

export interface ETH {
  assetType: AssetType.ETH;
  amount: BigNumberish;
}

export interface ERC20 {
  assetType: AssetType.ERC20;
  address: string;
  amount: BigNumberish;
}

export interface ERC721 {
  assetType: AssetType.ERC721;
  address: string;
  tokenId: BigNumberish;
}

export interface ERC1155 {
  assetType: AssetType.ERC1155;
  address: string;
  tokenId: BigNumberish;
  amount: BigNumberish;
}

export type Asset = ETH | ERC20 | ERC721 | ERC1155;

export interface AssetStruct {
  assetType: BigNumberish;
  token: string;
  identifier: BigNumberish;
  amount: BigNumberish;
}

export interface PackedAsset {
  assetId: BigNumberish;
  amount: BigNumberish;
}

//#endregion

//#region Houses

export enum HouseType {
  COMMUNITY = 'COMMUNITY',
}

export interface CommunityHouseConfig {
  contractURI: string;
}

export interface HouseConfig {
  [HouseType.COMMUNITY]: CommunityHouseConfig;
}

export interface HouseContract {
  [HouseType.COMMUNITY]: CommunityHouseContract;
}

export interface HouseInfo<T extends HouseType> {
  houseType: T;
  config: HouseConfig[T];
}

//#endregion

//#region Timed Round

export namespace Timed {
  export enum RoundState {
    UNKNOWN,
    CANCELLED,
    NOT_STARTED,
    IN_PROPOSING_PERIOD,
    IN_VOTING_PERIOD,
    IN_CLAIMING_PERIOD,
    COMPLETE,
  }
  export interface Config<CS extends Custom | void> {
    awards: Asset[];
    proposalThreshold?: BigNumberish;
    proposingStrategies?: GovPowerStrategyConfig<CS>[];
    votingStrategies: GovPowerStrategyConfig<CS>[];
    proposalPeriodStartUnixTimestamp: number;
    proposalPeriodDurationSecs: number;
    votePeriodDurationSecs: number;
    winnerCount: number;
  }
  export interface ConfigStruct {
    awards: AssetStruct[];
    proposalThreshold: BigNumberish;
    proposingStrategies: BigNumberish[];
    proposingStrategyParamsFlat: BigNumberish[];
    votingStrategies: BigNumberish[];
    votingStrategyParamsFlat: BigNumberish[];
    proposalPeriodStartTimestamp: BigNumberish;
    proposalPeriodDuration: BigNumberish;
    votePeriodDuration: BigNumberish;
    winnerCount: BigNumberish;
  }
  export interface ProposalVote {
    proposalId: number;
    votingPower: BigNumberish;
  }
  export interface ProposeMessage {
    round: string;
    authStrategy: string;
    usedProposingStrategies: GovPowerUserStrategy[];
    metadataUri: string;
  }
  export interface VoteMessage {
    round: string;
    authStrategy: string;
    usedVotingStrategies: GovPowerUserStrategy[];
    proposalVotes: ProposalVote[];
  }
  export interface EVMSigProposeMessage extends ProposeMessage {
    proposer: string;
    salt: string | number;
  }
  export interface EVMSigVoteMessage extends VoteMessage {
    voter: string;
    salt: string | number;
  }
  export interface VoteConfig {
    round: string;
    votes: Timed.ProposalVote[];
  }
  export interface ProposeConfig {
    round: string;
    metadataUri: string;
  }
  export enum Action {
    PROPOSE = 'PROPOSE',
    VOTE = 'VOTE',
  }
  export interface ActionData {
    [Action.PROPOSE]: EVMSigProposeMessage;
    [Action.VOTE]: EVMSigVoteMessage;
  }
  export interface RequestParams<A extends Action = Action> {
    address: string;
    signature: string;
    action: Action;
    data: ActionData[A];
  }
  export type Contract = TimedRoundContract;
  export interface ProposeCalldataConfig {
    proposer: string;
    metadataUri: string;
    usedProposingStrategies: GovPowerUserStrategy[];
  }
  export interface VoteCalldataConfig {
    voter: string;
    proposalVotes: ProposalVote[];
    usedVotingStrategies: GovPowerUserStrategy[];
  }
  export interface FinalizationConfig {
    round: string;
    awards: PackedAsset[];
  }
}

//#endregion

//#region Infinite Round

export namespace Infinite {
  export enum RoundState {
    UNKNOWN,
    CANCELLED,
    NOT_STARTED,
    ACTIVE,
    COMPLETE,
  }
  export interface Config<CS extends Custom | void> {
    proposalThreshold?: BigNumberish;
    proposingStrategies?: GovPowerStrategyConfig<CS>[];
    votingStrategies: GovPowerStrategyConfig<CS>[];
    startUnixTimestamp: number;
    votePeriodDurationSecs: number;
    quorumFor: BigNumberish;
    quorumAgainst: BigNumberish;
  }
  export interface ConfigStruct {
    proposalThreshold: BigNumberish;
    proposingStrategies: BigNumberish[];
    proposingStrategyParamsFlat: BigNumberish[];
    votingStrategies: BigNumberish[];
    votingStrategyParamsFlat: BigNumberish[];
    startTimestamp: BigNumberish;
    votePeriodDuration: BigNumberish;
    quorumFor: BigNumberish;
    quorumAgainst: BigNumberish;
  }
  export enum Direction {
    AGAINST = 0,
    FOR = 1,
  }
  export interface ProposalVote {
    proposalId: number;
    proposalVersion: number;
    votingPower: BigNumberish;
    direction: Direction;
  }
  export interface ProposeMessage {
    round: string;
    authStrategy: string;
    usedProposingStrategies: GovPowerUserStrategy[];
    requestedAssets: PackedAsset[];
    metadataUri: string;
  }
  export interface VoteMessage {
    round: string;
    authStrategy: string;
    usedVotingStrategies: GovPowerUserStrategy[];
    proposalVotes: ProposalVote[];
  }
  export interface EVMSigProposeMessage extends ProposeMessage {
    proposer: string;
    salt: string | number;
  }
  export interface EVMSigVoteMessage extends VoteMessage {
    voter: string;
    salt: string | number;
  }
  export interface VoteConfig {
    round: string;
    votes: Infinite.ProposalVote[];
  }
  export interface ProposeConfig {
    round: string;
    metadataUri: string;
    requestedAssets: Asset[];
  }
  export enum Action {
    PROPOSE = 'PROPOSE',
    VOTE = 'VOTE',
  }
  export interface ActionData {
    [Action.PROPOSE]: EVMSigProposeMessage;
    [Action.VOTE]: EVMSigVoteMessage;
  }
  export interface RequestParams<A extends Action = Action> {
    address: string;
    signature: string;
    action: Action;
    data: ActionData[A];
  }
  export type Contract = InfiniteRoundContract;
  export interface ProposeCalldataConfig {
    proposer: string;
    metadataUri: string;
    requestedAssets: PackedAsset[];
    usedProposingStrategies: GovPowerUserStrategy[];
  }
  export interface VoteCalldataConfig {
    voter: string;
    proposalVotes: ProposalVote[];
    usedVotingStrategies: GovPowerUserStrategy[];
  }
  export interface FinalizationConfig {
    round: string;
  }
}

//#endregion

//#region Round

export enum RoundType {
  INFINITE = 'INFINITE',
  TIMED = 'TIMED',
}

export enum RoundEventState {
  CREATED = 'CREATED',
  FINALIZED = 'FINALIZED',
  CANCELLED = 'CANCELLED',
}

export interface RoundConfigs<CS extends Custom | void = void> {
  [RoundType.INFINITE]: Infinite.Config<CS>;
  [RoundType.TIMED]: Timed.Config<CS>;
}

export interface RoundConfigStruct {
  [RoundType.INFINITE]: Infinite.ConfigStruct;
  [RoundType.TIMED]: Timed.ConfigStruct;
}

export interface RoundContract {
  [RoundType.INFINITE]: Infinite.Contract;
  [RoundType.TIMED]: Timed.Contract;
}

export interface GetRoundStateConfig {
  [RoundType.INFINITE]: Pick<Infinite.ConfigStruct, 'startTimestamp'>;
  [RoundType.TIMED]: Pick<
  Timed.ConfigStruct,
  'proposalPeriodStartTimestamp' | 'proposalPeriodDuration' | 'votePeriodDuration'
>;
}

export interface GetRoundStateParams<T extends RoundType = RoundType> {
  eventState: string;
  config: GetRoundStateConfig[T] | null | undefined;
}

export interface RoundInfo<T extends RoundType, CS extends Custom | void = void> {
  roundType: T;
  config: RoundConfigs<CS>[T];
  title: string;
  description: string;
}

export interface RoundChainConfig<CS extends void | Custom = void> extends ChainConfig {
  govPower?: GovPowerManager<CS>;
  query?: QueryWrapper;
  customStarknetRelayer?: string;
}

//#endregion

//#region Governance Power Strategies

export interface GovPowerChainConfig<CS extends Custom | void> extends ChainConfig {
  customStrategies?: Newable<StrategyHandlerBase<GovPowerStrategyConfig<CS>>>[];
}

export enum GovPowerStrategyType {
  ERC1155_BALANCE_OF = 'ERC1155_BALANCE_OF',
  BALANCE_OF = 'BALANCE_OF',
  ALLOWLIST = 'ALLOWLIST',
  VANILLA = 'VANILLA',
  UNKNOWN = 'UNKNOWN',
}

// Helpful aliases
export type ProposingStrategyType = GovPowerStrategyType;
export type VotingStrategyType = GovPowerStrategyType;

export const ProposingStrategyType = GovPowerStrategyType;
export const VotingStrategyType = GovPowerStrategyType;

export interface BalanceOf {
  strategyType: GovPowerStrategyType.BALANCE_OF;
  assetType: AssetType.ERC20 | AssetType.ERC721;
  address: string;
  multiplier?: number;
}

export interface ERC1155BalanceOf {
  strategyType: GovPowerStrategyType.ERC1155_BALANCE_OF;
  assetType: AssetType.ERC1155;
  address: string;
  tokenId: string;
  multiplier?: number;
}

export interface AllowlistMember {
  address: string;
  govPower: string;
}

export interface Allowlist {
  strategyType: GovPowerStrategyType.ALLOWLIST;
  members: AllowlistMember[];
}

export interface Vanilla {
  strategyType: GovPowerStrategyType.VANILLA;
}

export interface Custom {
  strategyType: string;
}

export type DefaultGovPowerConfigs = BalanceOf | ERC1155BalanceOf | Allowlist | Vanilla;

// prettier-ignore
export type GovPowerStrategyConfig<C extends Custom | void = void> = C extends void ? DefaultGovPowerConfigs : DefaultGovPowerConfigs | C;

export interface GovPowerStrategy {
  address: string;
  params: (string | number)[];
}

export interface GovPowerUserStrategy {
  id: string;
  userParams: (string | number)[];
}

export interface GovPowerStrategyWithID extends GovPowerStrategy {
  id: string;
}

export interface GovPowerConfig {
  user: string;
  timestamp: string | number;
  address: string;
  params: (string | number)[];
}

//#region Helpers

export type Newable<T> = new (...args: any[]) => T;

export type Address = `0x${string}` | string;

export interface Uint256 {
  low: string;
  high: string;
}

//#endregion

//#region GraphQL

export interface GraphQL<T = string> {
  evm: T;
  starknet: T;
}

//#endregion
