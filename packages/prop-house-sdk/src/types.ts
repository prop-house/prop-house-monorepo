import { BigNumberish } from '@ethersproject/bignumber';
import { TimedFundingRoundEnvelope } from './rounds';
import { Call, Provider } from 'starknet';

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

//#endregion

//#region Houses

export enum HouseType {
  FUNDING = 'FUNDING',
}

export interface FundingHouseConfig {
  contractURI: string;
}

export interface HouseConfig {
  [HouseType.FUNDING]: FundingHouseConfig;
}

export interface HouseInfo<T extends HouseType> {
  houseType: T;
  config: HouseConfig[T];
}

//#endregion

//#region Rounds

export enum RoundType {
  TIMED_FUNDING = 'TIMED_FUNDING',
}

export interface TimedFundingRoundConfig {
  awards: Asset[];
  strategies: VotingStrategyInfo[];
  proposalPeriodStartTimestamp: number;
  proposalPeriodDuration: number;
  votePeriodDuration: number;
  winnerCount: number;
}

export interface RoundConfig {
  [RoundType.TIMED_FUNDING]: TimedFundingRoundConfig;
}

export interface RoundInfo<T extends RoundType> {
  roundType: T;
  config: RoundConfig[T];
  title: string;
  description: string;
}

//#endregion

//#region Voting Strategies

export enum VotingStrategyType {
  BALANCE_OF = 'BALANCE_OF',
  WHITELIST = 'WHITELIST',
  VANILLA = 'VANILLA',
}

export interface BalanceOf {
  strategyType: VotingStrategyType.BALANCE_OF;
  assetType: AssetType.ERC20 | AssetType.ERC721;
  address: string;
  multiplier?: number;
}

export interface BalanceOfWithTokenID {
  strategyType: VotingStrategyType.BALANCE_OF;
  assetType: AssetType.ERC1155;
  address: string;
  tokenId: string;
  multiplier?: number;
}

export interface WhitelistMember {
  address: string;
  votingPower: string;
}

export interface Whitelist {
  strategyType: VotingStrategyType.WHITELIST;
  members: WhitelistMember[];
}

export interface Vanilla {
  strategyType: VotingStrategyType.VANILLA;
}

export interface Custom {
  strategyType: string;
}

// prettier-ignore
export type VotingStrategyInfo<C extends Custom = Custom> = BalanceOf | BalanceOfWithTokenID | Whitelist | Vanilla | C;

export interface VotingStrategyStruct {
  addr: BigNumberish;
  params: BigNumberish[];
}

//#endregion

//#region Starknet

export interface ClientConfig {
  ethUrl: string;
  starkProvider: Provider;
}

export interface IEnvelope<Message, SignatureMessage, Action> {
  address: string;
  signature: Message extends SignatureMessage ? string : null;
  data: {
    action: Action;
    message: Message;
  };
}

export interface AuthStrategy<Message, SignatureMessage, Action> {
  type: string;
  createCall(
    envelope: IEnvelope<Message, SignatureMessage, Action>,
    selector: string,
    calldata: string[],
  ): Call;
}

export type Envelope = TimedFundingRoundEnvelope;

export interface StarknetVotingStrategy<E extends Envelope> {
  type: string;
  getParams(
    address: string,
    index: number,
    envelope: E,
    clientConfig: ClientConfig,
  ): Promise<string[]>;
}

//#endregion

//#region Helpers

export type Newable<T> = new (...args: any[]) => T;

//#endregion
