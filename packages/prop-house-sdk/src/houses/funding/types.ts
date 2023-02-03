import { BigNumberish } from '@ethersproject/bignumber';
import { FundingHouseStrategy } from '../../strategies';

export enum FundingHouseActionName {
  DepositETH = 'DEPOSIT_ETH',
  DepositERC20 = 'DEPOSIT_ERC20',
  DepositERC721 = 'DEPOSIT_ERC721',
  DepositERC1155 = 'DEPOSIT_ERC1155',
  BatchDepositERC20 = 'BATCH_DEPOSIT_ERC20',
  BatchDepositERC721 = 'BATCH_DEPOSIT_ERC721',
  BatchDepositERC1155 = 'BATCH_DEPOSIT_ERC1155',
  InitiateRound = 'INITIATE_ROUND',
}

export interface NonPayableFundingHouseAction {
  name: Omit<FundingHouseActionName, FundingHouseActionName.DepositETH>;
  data: string;
}

export interface PayableFundingHouseAction {
  name: FundingHouseActionName.DepositETH;
  data: string;
  value: BigNumberish;
}

export type FundingHouseAction = NonPayableFundingHouseAction | PayableFundingHouseAction;

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

export type Award = ETH | ERC20 | ERC721 | ERC1155;

export interface RoundParams {
  title: string;
  description: string;
  tags: string[];
  votingStrategies: string[];
  strategy: FundingHouseStrategy;
  awards: Award[];
}

export type Class<T = any> = new (...args: any[]) => T;

// NEW

export interface RoundConfig {
  title: string;
  description: string;
  tags: string[];
  votingStrategyIds: string[];
  strategy: FundingHouseStrategy;
}
