/* eslint-disable */
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  BigDecimal: any;
  BigInt: any;
  Bytes: any;
};

export type Account = {
  __typename?: 'Account';
  /** Claims made by the account */
  claims: Array<Claim>;
  /** Rounds created by the account */
  createdRounds: Array<Round>;
  /** Houses on which the account can create rounds */
  creatorOnHouses: Array<RoundCreator>;
  /** Deposits made by the account */
  deposits: Array<Deposit>;
  /** The account address */
  id: Scalars['ID'];
  /** Incoming asset receipt transfers involving the account */
  incomingTransfers: Array<Transfer>;
  /** Outgoing asset receipt transfers involving the account */
  outgoingTransfers: Array<Transfer>;
  /** Houses owned by the account */
  ownedHouses: Array<House>;
  /** Reclamations made by the account */
  reclamations: Array<Reclaim>;
  /** Rescues made by the account */
  rescues: Array<Rescue>;
};

export type AccountClaimsArgs = {
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Claim_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  where?: InputMaybe<Claim_Filter>;
};

export type AccountCreatedRoundsArgs = {
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Round_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  where?: InputMaybe<Round_Filter>;
};

export type AccountCreatorOnHousesArgs = {
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<RoundCreator_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  where?: InputMaybe<RoundCreator_Filter>;
};

export type AccountDepositsArgs = {
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Deposit_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  where?: InputMaybe<Deposit_Filter>;
};

export type AccountIncomingTransfersArgs = {
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Transfer_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  where?: InputMaybe<Transfer_Filter>;
};

export type AccountOutgoingTransfersArgs = {
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Transfer_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  where?: InputMaybe<Transfer_Filter>;
};

export type AccountOwnedHousesArgs = {
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<House_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  where?: InputMaybe<House_Filter>;
};

export type AccountReclamationsArgs = {
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Reclaim_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  where?: InputMaybe<Reclaim_Filter>;
};

export type AccountRescuesArgs = {
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Rescue_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  where?: InputMaybe<Rescue_Filter>;
};

export type Account_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  and?: InputMaybe<Array<InputMaybe<Account_Filter>>>;
  claims_?: InputMaybe<Claim_Filter>;
  createdRounds_?: InputMaybe<Round_Filter>;
  creatorOnHouses_?: InputMaybe<RoundCreator_Filter>;
  deposits_?: InputMaybe<Deposit_Filter>;
  id?: InputMaybe<Scalars['ID']>;
  id_gt?: InputMaybe<Scalars['ID']>;
  id_gte?: InputMaybe<Scalars['ID']>;
  id_in?: InputMaybe<Array<Scalars['ID']>>;
  id_lt?: InputMaybe<Scalars['ID']>;
  id_lte?: InputMaybe<Scalars['ID']>;
  id_not?: InputMaybe<Scalars['ID']>;
  id_not_in?: InputMaybe<Array<Scalars['ID']>>;
  incomingTransfers_?: InputMaybe<Transfer_Filter>;
  or?: InputMaybe<Array<InputMaybe<Account_Filter>>>;
  outgoingTransfers_?: InputMaybe<Transfer_Filter>;
  ownedHouses_?: InputMaybe<House_Filter>;
  reclamations_?: InputMaybe<Reclaim_Filter>;
  rescues_?: InputMaybe<Rescue_Filter>;
};

export enum Account_OrderBy {
  Claims = 'claims',
  CreatedRounds = 'createdRounds',
  CreatorOnHouses = 'creatorOnHouses',
  Deposits = 'deposits',
  Id = 'id',
  IncomingTransfers = 'incomingTransfers',
  OutgoingTransfers = 'outgoingTransfers',
  OwnedHouses = 'ownedHouses',
  Reclamations = 'reclamations',
  Rescues = 'rescues',
}

export type Administrative = {
  __typename?: 'Administrative';
  /** All registered house implementations */
  houseImpls?: Maybe<Array<HouseImplementation>>;
  /** The manager contract address */
  id: Scalars['ID'];
  /** The account who controls house and round registration */
  manager: Scalars['Bytes'];
};

export type AdministrativeHouseImplsArgs = {
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<HouseImplementation_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  where?: InputMaybe<HouseImplementation_Filter>;
};

export type Administrative_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  and?: InputMaybe<Array<InputMaybe<Administrative_Filter>>>;
  houseImpls?: InputMaybe<Array<Scalars['String']>>;
  houseImpls_?: InputMaybe<HouseImplementation_Filter>;
  houseImpls_contains?: InputMaybe<Array<Scalars['String']>>;
  houseImpls_contains_nocase?: InputMaybe<Array<Scalars['String']>>;
  houseImpls_not?: InputMaybe<Array<Scalars['String']>>;
  houseImpls_not_contains?: InputMaybe<Array<Scalars['String']>>;
  houseImpls_not_contains_nocase?: InputMaybe<Array<Scalars['String']>>;
  id?: InputMaybe<Scalars['ID']>;
  id_gt?: InputMaybe<Scalars['ID']>;
  id_gte?: InputMaybe<Scalars['ID']>;
  id_in?: InputMaybe<Array<Scalars['ID']>>;
  id_lt?: InputMaybe<Scalars['ID']>;
  id_lte?: InputMaybe<Scalars['ID']>;
  id_not?: InputMaybe<Scalars['ID']>;
  id_not_in?: InputMaybe<Array<Scalars['ID']>>;
  manager?: InputMaybe<Scalars['Bytes']>;
  manager_contains?: InputMaybe<Scalars['Bytes']>;
  manager_gt?: InputMaybe<Scalars['Bytes']>;
  manager_gte?: InputMaybe<Scalars['Bytes']>;
  manager_in?: InputMaybe<Array<Scalars['Bytes']>>;
  manager_lt?: InputMaybe<Scalars['Bytes']>;
  manager_lte?: InputMaybe<Scalars['Bytes']>;
  manager_not?: InputMaybe<Scalars['Bytes']>;
  manager_not_contains?: InputMaybe<Scalars['Bytes']>;
  manager_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  or?: InputMaybe<Array<InputMaybe<Administrative_Filter>>>;
};

export enum Administrative_OrderBy {
  HouseImpls = 'houseImpls',
  Id = 'id',
  Manager = 'manager',
}

export type Asset = {
  __typename?: 'Asset';
  /** The asset type (Native | ERC20 | ERC721 | ERC1155) */
  assetType: AssetType;
  /** The asset ID (as defined in the `AssetController`) */
  id: Scalars['ID'];
  /** The token ID (`0` if N/A) */
  identifier: Scalars['BigInt'];
  /** The token address (`0` if N/A) */
  token: Scalars['Bytes'];
};

export enum AssetType {
  Erc20 = 'ERC20',
  Erc721 = 'ERC721',
  Erc1155 = 'ERC1155',
  Native = 'NATIVE',
}

export type Asset_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  and?: InputMaybe<Array<InputMaybe<Asset_Filter>>>;
  assetType?: InputMaybe<AssetType>;
  assetType_in?: InputMaybe<Array<AssetType>>;
  assetType_not?: InputMaybe<AssetType>;
  assetType_not_in?: InputMaybe<Array<AssetType>>;
  id?: InputMaybe<Scalars['ID']>;
  id_gt?: InputMaybe<Scalars['ID']>;
  id_gte?: InputMaybe<Scalars['ID']>;
  id_in?: InputMaybe<Array<Scalars['ID']>>;
  id_lt?: InputMaybe<Scalars['ID']>;
  id_lte?: InputMaybe<Scalars['ID']>;
  id_not?: InputMaybe<Scalars['ID']>;
  id_not_in?: InputMaybe<Array<Scalars['ID']>>;
  identifier?: InputMaybe<Scalars['BigInt']>;
  identifier_gt?: InputMaybe<Scalars['BigInt']>;
  identifier_gte?: InputMaybe<Scalars['BigInt']>;
  identifier_in?: InputMaybe<Array<Scalars['BigInt']>>;
  identifier_lt?: InputMaybe<Scalars['BigInt']>;
  identifier_lte?: InputMaybe<Scalars['BigInt']>;
  identifier_not?: InputMaybe<Scalars['BigInt']>;
  identifier_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  or?: InputMaybe<Array<InputMaybe<Asset_Filter>>>;
  token?: InputMaybe<Scalars['Bytes']>;
  token_contains?: InputMaybe<Scalars['Bytes']>;
  token_gt?: InputMaybe<Scalars['Bytes']>;
  token_gte?: InputMaybe<Scalars['Bytes']>;
  token_in?: InputMaybe<Array<Scalars['Bytes']>>;
  token_lt?: InputMaybe<Scalars['Bytes']>;
  token_lte?: InputMaybe<Scalars['Bytes']>;
  token_not?: InputMaybe<Scalars['Bytes']>;
  token_not_contains?: InputMaybe<Scalars['Bytes']>;
  token_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
};

export enum Asset_OrderBy {
  AssetType = 'assetType',
  Id = 'id',
  Identifier = 'identifier',
  Token = 'token',
}

export type Award = {
  __typename?: 'Award';
  /** The amount of the asset offered */
  amount: Scalars['BigInt'];
  /** The asset information */
  asset: Asset;
  /** A concatenation of the round address and award index */
  id: Scalars['ID'];
  /** The configuration in which the awards exist */
  round: TimedFundingRoundConfig;
};

export type Award_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  amount?: InputMaybe<Scalars['BigInt']>;
  amount_gt?: InputMaybe<Scalars['BigInt']>;
  amount_gte?: InputMaybe<Scalars['BigInt']>;
  amount_in?: InputMaybe<Array<Scalars['BigInt']>>;
  amount_lt?: InputMaybe<Scalars['BigInt']>;
  amount_lte?: InputMaybe<Scalars['BigInt']>;
  amount_not?: InputMaybe<Scalars['BigInt']>;
  amount_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  and?: InputMaybe<Array<InputMaybe<Award_Filter>>>;
  asset?: InputMaybe<Scalars['String']>;
  asset_?: InputMaybe<Asset_Filter>;
  asset_contains?: InputMaybe<Scalars['String']>;
  asset_contains_nocase?: InputMaybe<Scalars['String']>;
  asset_ends_with?: InputMaybe<Scalars['String']>;
  asset_ends_with_nocase?: InputMaybe<Scalars['String']>;
  asset_gt?: InputMaybe<Scalars['String']>;
  asset_gte?: InputMaybe<Scalars['String']>;
  asset_in?: InputMaybe<Array<Scalars['String']>>;
  asset_lt?: InputMaybe<Scalars['String']>;
  asset_lte?: InputMaybe<Scalars['String']>;
  asset_not?: InputMaybe<Scalars['String']>;
  asset_not_contains?: InputMaybe<Scalars['String']>;
  asset_not_contains_nocase?: InputMaybe<Scalars['String']>;
  asset_not_ends_with?: InputMaybe<Scalars['String']>;
  asset_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  asset_not_in?: InputMaybe<Array<Scalars['String']>>;
  asset_not_starts_with?: InputMaybe<Scalars['String']>;
  asset_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  asset_starts_with?: InputMaybe<Scalars['String']>;
  asset_starts_with_nocase?: InputMaybe<Scalars['String']>;
  id?: InputMaybe<Scalars['ID']>;
  id_gt?: InputMaybe<Scalars['ID']>;
  id_gte?: InputMaybe<Scalars['ID']>;
  id_in?: InputMaybe<Array<Scalars['ID']>>;
  id_lt?: InputMaybe<Scalars['ID']>;
  id_lte?: InputMaybe<Scalars['ID']>;
  id_not?: InputMaybe<Scalars['ID']>;
  id_not_in?: InputMaybe<Array<Scalars['ID']>>;
  or?: InputMaybe<Array<InputMaybe<Award_Filter>>>;
  round?: InputMaybe<Scalars['String']>;
  round_?: InputMaybe<TimedFundingRoundConfig_Filter>;
  round_contains?: InputMaybe<Scalars['String']>;
  round_contains_nocase?: InputMaybe<Scalars['String']>;
  round_ends_with?: InputMaybe<Scalars['String']>;
  round_ends_with_nocase?: InputMaybe<Scalars['String']>;
  round_gt?: InputMaybe<Scalars['String']>;
  round_gte?: InputMaybe<Scalars['String']>;
  round_in?: InputMaybe<Array<Scalars['String']>>;
  round_lt?: InputMaybe<Scalars['String']>;
  round_lte?: InputMaybe<Scalars['String']>;
  round_not?: InputMaybe<Scalars['String']>;
  round_not_contains?: InputMaybe<Scalars['String']>;
  round_not_contains_nocase?: InputMaybe<Scalars['String']>;
  round_not_ends_with?: InputMaybe<Scalars['String']>;
  round_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  round_not_in?: InputMaybe<Array<Scalars['String']>>;
  round_not_starts_with?: InputMaybe<Scalars['String']>;
  round_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  round_starts_with?: InputMaybe<Scalars['String']>;
  round_starts_with_nocase?: InputMaybe<Scalars['String']>;
};

export enum Award_OrderBy {
  Amount = 'amount',
  Asset = 'asset',
  AssetAssetType = 'asset__assetType',
  AssetId = 'asset__id',
  AssetIdentifier = 'asset__identifier',
  AssetToken = 'asset__token',
  Id = 'id',
  Round = 'round',
  RoundId = 'round__id',
  RoundProposalPeriodDuration = 'round__proposalPeriodDuration',
  RoundProposalPeriodStartTimestamp = 'round__proposalPeriodStartTimestamp',
  RoundRegisteredAt = 'round__registeredAt',
  RoundRegistrationTx = 'round__registrationTx',
  RoundVotePeriodDuration = 'round__votePeriodDuration',
  RoundVotePeriodStartTimestamp = 'round__votePeriodStartTimestamp',
  RoundWinnerCount = 'round__winnerCount',
}

export type Balance = {
  __typename?: 'Balance';
  /** The asset information */
  asset: Asset;
  /** The asset balance (base units) */
  balance: Scalars['BigInt'];
  /** A concatenation of the round address and asset ID */
  id: Scalars['String'];
  /** The round that holds the balance */
  round: Round;
  /** The unix timestamp at which the balance was last updated */
  updatedAt: Scalars['BigInt'];
};

export type Balance_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  and?: InputMaybe<Array<InputMaybe<Balance_Filter>>>;
  asset?: InputMaybe<Scalars['String']>;
  asset_?: InputMaybe<Asset_Filter>;
  asset_contains?: InputMaybe<Scalars['String']>;
  asset_contains_nocase?: InputMaybe<Scalars['String']>;
  asset_ends_with?: InputMaybe<Scalars['String']>;
  asset_ends_with_nocase?: InputMaybe<Scalars['String']>;
  asset_gt?: InputMaybe<Scalars['String']>;
  asset_gte?: InputMaybe<Scalars['String']>;
  asset_in?: InputMaybe<Array<Scalars['String']>>;
  asset_lt?: InputMaybe<Scalars['String']>;
  asset_lte?: InputMaybe<Scalars['String']>;
  asset_not?: InputMaybe<Scalars['String']>;
  asset_not_contains?: InputMaybe<Scalars['String']>;
  asset_not_contains_nocase?: InputMaybe<Scalars['String']>;
  asset_not_ends_with?: InputMaybe<Scalars['String']>;
  asset_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  asset_not_in?: InputMaybe<Array<Scalars['String']>>;
  asset_not_starts_with?: InputMaybe<Scalars['String']>;
  asset_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  asset_starts_with?: InputMaybe<Scalars['String']>;
  asset_starts_with_nocase?: InputMaybe<Scalars['String']>;
  balance?: InputMaybe<Scalars['BigInt']>;
  balance_gt?: InputMaybe<Scalars['BigInt']>;
  balance_gte?: InputMaybe<Scalars['BigInt']>;
  balance_in?: InputMaybe<Array<Scalars['BigInt']>>;
  balance_lt?: InputMaybe<Scalars['BigInt']>;
  balance_lte?: InputMaybe<Scalars['BigInt']>;
  balance_not?: InputMaybe<Scalars['BigInt']>;
  balance_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  id?: InputMaybe<Scalars['String']>;
  id_contains?: InputMaybe<Scalars['String']>;
  id_contains_nocase?: InputMaybe<Scalars['String']>;
  id_ends_with?: InputMaybe<Scalars['String']>;
  id_ends_with_nocase?: InputMaybe<Scalars['String']>;
  id_gt?: InputMaybe<Scalars['String']>;
  id_gte?: InputMaybe<Scalars['String']>;
  id_in?: InputMaybe<Array<Scalars['String']>>;
  id_lt?: InputMaybe<Scalars['String']>;
  id_lte?: InputMaybe<Scalars['String']>;
  id_not?: InputMaybe<Scalars['String']>;
  id_not_contains?: InputMaybe<Scalars['String']>;
  id_not_contains_nocase?: InputMaybe<Scalars['String']>;
  id_not_ends_with?: InputMaybe<Scalars['String']>;
  id_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  id_not_in?: InputMaybe<Array<Scalars['String']>>;
  id_not_starts_with?: InputMaybe<Scalars['String']>;
  id_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  id_starts_with?: InputMaybe<Scalars['String']>;
  id_starts_with_nocase?: InputMaybe<Scalars['String']>;
  or?: InputMaybe<Array<InputMaybe<Balance_Filter>>>;
  round?: InputMaybe<Scalars['String']>;
  round_?: InputMaybe<Round_Filter>;
  round_contains?: InputMaybe<Scalars['String']>;
  round_contains_nocase?: InputMaybe<Scalars['String']>;
  round_ends_with?: InputMaybe<Scalars['String']>;
  round_ends_with_nocase?: InputMaybe<Scalars['String']>;
  round_gt?: InputMaybe<Scalars['String']>;
  round_gte?: InputMaybe<Scalars['String']>;
  round_in?: InputMaybe<Array<Scalars['String']>>;
  round_lt?: InputMaybe<Scalars['String']>;
  round_lte?: InputMaybe<Scalars['String']>;
  round_not?: InputMaybe<Scalars['String']>;
  round_not_contains?: InputMaybe<Scalars['String']>;
  round_not_contains_nocase?: InputMaybe<Scalars['String']>;
  round_not_ends_with?: InputMaybe<Scalars['String']>;
  round_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  round_not_in?: InputMaybe<Array<Scalars['String']>>;
  round_not_starts_with?: InputMaybe<Scalars['String']>;
  round_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  round_starts_with?: InputMaybe<Scalars['String']>;
  round_starts_with_nocase?: InputMaybe<Scalars['String']>;
  updatedAt?: InputMaybe<Scalars['BigInt']>;
  updatedAt_gt?: InputMaybe<Scalars['BigInt']>;
  updatedAt_gte?: InputMaybe<Scalars['BigInt']>;
  updatedAt_in?: InputMaybe<Array<Scalars['BigInt']>>;
  updatedAt_lt?: InputMaybe<Scalars['BigInt']>;
  updatedAt_lte?: InputMaybe<Scalars['BigInt']>;
  updatedAt_not?: InputMaybe<Scalars['BigInt']>;
  updatedAt_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
};

export enum Balance_OrderBy {
  Asset = 'asset',
  AssetAssetType = 'asset__assetType',
  AssetId = 'asset__id',
  AssetIdentifier = 'asset__identifier',
  AssetToken = 'asset__token',
  Balance = 'balance',
  Id = 'id',
  Round = 'round',
  RoundCreatedAt = 'round__createdAt',
  RoundCreationTx = 'round__creationTx',
  RoundDescription = 'round__description',
  RoundId = 'round__id',
  RoundState = 'round__state',
  RoundTitle = 'round__title',
  RoundType = 'round__type',
  UpdatedAt = 'updatedAt',
}

export type BlockChangedFilter = {
  number_gte: Scalars['Int'];
};

export type Block_Height = {
  hash?: InputMaybe<Scalars['Bytes']>;
  number?: InputMaybe<Scalars['Int']>;
  number_gte?: InputMaybe<Scalars['Int']>;
};

export type Claim = {
  __typename?: 'Claim';
  /** The amount of the asset that was claimed */
  amount: Scalars['BigInt'];
  /** The asset that was claimed */
  asset: Asset;
  /** The unix timestamp when this claim was performed */
  claimedAt: Scalars['BigInt'];
  /** The account who claimed the asset */
  claimer: Account;
  /** A concatenation of the claim tx hash and the the event log index */
  id: Scalars['ID'];
  /** The winning proposal ID */
  proposalId: Scalars['BigInt'];
  /** The recipient of the asset */
  recipient: Scalars['Bytes'];
  /** The round on which the asset was claimed */
  round: Round;
};

export type Claim_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  amount?: InputMaybe<Scalars['BigInt']>;
  amount_gt?: InputMaybe<Scalars['BigInt']>;
  amount_gte?: InputMaybe<Scalars['BigInt']>;
  amount_in?: InputMaybe<Array<Scalars['BigInt']>>;
  amount_lt?: InputMaybe<Scalars['BigInt']>;
  amount_lte?: InputMaybe<Scalars['BigInt']>;
  amount_not?: InputMaybe<Scalars['BigInt']>;
  amount_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  and?: InputMaybe<Array<InputMaybe<Claim_Filter>>>;
  asset?: InputMaybe<Scalars['String']>;
  asset_?: InputMaybe<Asset_Filter>;
  asset_contains?: InputMaybe<Scalars['String']>;
  asset_contains_nocase?: InputMaybe<Scalars['String']>;
  asset_ends_with?: InputMaybe<Scalars['String']>;
  asset_ends_with_nocase?: InputMaybe<Scalars['String']>;
  asset_gt?: InputMaybe<Scalars['String']>;
  asset_gte?: InputMaybe<Scalars['String']>;
  asset_in?: InputMaybe<Array<Scalars['String']>>;
  asset_lt?: InputMaybe<Scalars['String']>;
  asset_lte?: InputMaybe<Scalars['String']>;
  asset_not?: InputMaybe<Scalars['String']>;
  asset_not_contains?: InputMaybe<Scalars['String']>;
  asset_not_contains_nocase?: InputMaybe<Scalars['String']>;
  asset_not_ends_with?: InputMaybe<Scalars['String']>;
  asset_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  asset_not_in?: InputMaybe<Array<Scalars['String']>>;
  asset_not_starts_with?: InputMaybe<Scalars['String']>;
  asset_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  asset_starts_with?: InputMaybe<Scalars['String']>;
  asset_starts_with_nocase?: InputMaybe<Scalars['String']>;
  claimedAt?: InputMaybe<Scalars['BigInt']>;
  claimedAt_gt?: InputMaybe<Scalars['BigInt']>;
  claimedAt_gte?: InputMaybe<Scalars['BigInt']>;
  claimedAt_in?: InputMaybe<Array<Scalars['BigInt']>>;
  claimedAt_lt?: InputMaybe<Scalars['BigInt']>;
  claimedAt_lte?: InputMaybe<Scalars['BigInt']>;
  claimedAt_not?: InputMaybe<Scalars['BigInt']>;
  claimedAt_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  claimer?: InputMaybe<Scalars['String']>;
  claimer_?: InputMaybe<Account_Filter>;
  claimer_contains?: InputMaybe<Scalars['String']>;
  claimer_contains_nocase?: InputMaybe<Scalars['String']>;
  claimer_ends_with?: InputMaybe<Scalars['String']>;
  claimer_ends_with_nocase?: InputMaybe<Scalars['String']>;
  claimer_gt?: InputMaybe<Scalars['String']>;
  claimer_gte?: InputMaybe<Scalars['String']>;
  claimer_in?: InputMaybe<Array<Scalars['String']>>;
  claimer_lt?: InputMaybe<Scalars['String']>;
  claimer_lte?: InputMaybe<Scalars['String']>;
  claimer_not?: InputMaybe<Scalars['String']>;
  claimer_not_contains?: InputMaybe<Scalars['String']>;
  claimer_not_contains_nocase?: InputMaybe<Scalars['String']>;
  claimer_not_ends_with?: InputMaybe<Scalars['String']>;
  claimer_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  claimer_not_in?: InputMaybe<Array<Scalars['String']>>;
  claimer_not_starts_with?: InputMaybe<Scalars['String']>;
  claimer_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  claimer_starts_with?: InputMaybe<Scalars['String']>;
  claimer_starts_with_nocase?: InputMaybe<Scalars['String']>;
  id?: InputMaybe<Scalars['ID']>;
  id_gt?: InputMaybe<Scalars['ID']>;
  id_gte?: InputMaybe<Scalars['ID']>;
  id_in?: InputMaybe<Array<Scalars['ID']>>;
  id_lt?: InputMaybe<Scalars['ID']>;
  id_lte?: InputMaybe<Scalars['ID']>;
  id_not?: InputMaybe<Scalars['ID']>;
  id_not_in?: InputMaybe<Array<Scalars['ID']>>;
  or?: InputMaybe<Array<InputMaybe<Claim_Filter>>>;
  proposalId?: InputMaybe<Scalars['BigInt']>;
  proposalId_gt?: InputMaybe<Scalars['BigInt']>;
  proposalId_gte?: InputMaybe<Scalars['BigInt']>;
  proposalId_in?: InputMaybe<Array<Scalars['BigInt']>>;
  proposalId_lt?: InputMaybe<Scalars['BigInt']>;
  proposalId_lte?: InputMaybe<Scalars['BigInt']>;
  proposalId_not?: InputMaybe<Scalars['BigInt']>;
  proposalId_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  recipient?: InputMaybe<Scalars['Bytes']>;
  recipient_contains?: InputMaybe<Scalars['Bytes']>;
  recipient_gt?: InputMaybe<Scalars['Bytes']>;
  recipient_gte?: InputMaybe<Scalars['Bytes']>;
  recipient_in?: InputMaybe<Array<Scalars['Bytes']>>;
  recipient_lt?: InputMaybe<Scalars['Bytes']>;
  recipient_lte?: InputMaybe<Scalars['Bytes']>;
  recipient_not?: InputMaybe<Scalars['Bytes']>;
  recipient_not_contains?: InputMaybe<Scalars['Bytes']>;
  recipient_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  round?: InputMaybe<Scalars['String']>;
  round_?: InputMaybe<Round_Filter>;
  round_contains?: InputMaybe<Scalars['String']>;
  round_contains_nocase?: InputMaybe<Scalars['String']>;
  round_ends_with?: InputMaybe<Scalars['String']>;
  round_ends_with_nocase?: InputMaybe<Scalars['String']>;
  round_gt?: InputMaybe<Scalars['String']>;
  round_gte?: InputMaybe<Scalars['String']>;
  round_in?: InputMaybe<Array<Scalars['String']>>;
  round_lt?: InputMaybe<Scalars['String']>;
  round_lte?: InputMaybe<Scalars['String']>;
  round_not?: InputMaybe<Scalars['String']>;
  round_not_contains?: InputMaybe<Scalars['String']>;
  round_not_contains_nocase?: InputMaybe<Scalars['String']>;
  round_not_ends_with?: InputMaybe<Scalars['String']>;
  round_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  round_not_in?: InputMaybe<Array<Scalars['String']>>;
  round_not_starts_with?: InputMaybe<Scalars['String']>;
  round_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  round_starts_with?: InputMaybe<Scalars['String']>;
  round_starts_with_nocase?: InputMaybe<Scalars['String']>;
};

export enum Claim_OrderBy {
  Amount = 'amount',
  Asset = 'asset',
  AssetAssetType = 'asset__assetType',
  AssetId = 'asset__id',
  AssetIdentifier = 'asset__identifier',
  AssetToken = 'asset__token',
  ClaimedAt = 'claimedAt',
  Claimer = 'claimer',
  ClaimerId = 'claimer__id',
  Id = 'id',
  ProposalId = 'proposalId',
  Recipient = 'recipient',
  Round = 'round',
  RoundCreatedAt = 'round__createdAt',
  RoundCreationTx = 'round__creationTx',
  RoundDescription = 'round__description',
  RoundId = 'round__id',
  RoundState = 'round__state',
  RoundTitle = 'round__title',
  RoundType = 'round__type',
}

export type Deposit = {
  __typename?: 'Deposit';
  /** The deposit amount */
  amount: Scalars['BigInt'];
  /** The asset that was deposited */
  asset: Asset;
  /** The unix timestamp when this deposit was performed */
  depositedAt: Scalars['BigInt'];
  /** The account who made the deposit */
  depositor: Account;
  /** A concatenation of the deposit tx hash and the the event log index */
  id: Scalars['String'];
  /** The round that received the deposit */
  round: Round;
};

export type Deposit_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  amount?: InputMaybe<Scalars['BigInt']>;
  amount_gt?: InputMaybe<Scalars['BigInt']>;
  amount_gte?: InputMaybe<Scalars['BigInt']>;
  amount_in?: InputMaybe<Array<Scalars['BigInt']>>;
  amount_lt?: InputMaybe<Scalars['BigInt']>;
  amount_lte?: InputMaybe<Scalars['BigInt']>;
  amount_not?: InputMaybe<Scalars['BigInt']>;
  amount_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  and?: InputMaybe<Array<InputMaybe<Deposit_Filter>>>;
  asset?: InputMaybe<Scalars['String']>;
  asset_?: InputMaybe<Asset_Filter>;
  asset_contains?: InputMaybe<Scalars['String']>;
  asset_contains_nocase?: InputMaybe<Scalars['String']>;
  asset_ends_with?: InputMaybe<Scalars['String']>;
  asset_ends_with_nocase?: InputMaybe<Scalars['String']>;
  asset_gt?: InputMaybe<Scalars['String']>;
  asset_gte?: InputMaybe<Scalars['String']>;
  asset_in?: InputMaybe<Array<Scalars['String']>>;
  asset_lt?: InputMaybe<Scalars['String']>;
  asset_lte?: InputMaybe<Scalars['String']>;
  asset_not?: InputMaybe<Scalars['String']>;
  asset_not_contains?: InputMaybe<Scalars['String']>;
  asset_not_contains_nocase?: InputMaybe<Scalars['String']>;
  asset_not_ends_with?: InputMaybe<Scalars['String']>;
  asset_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  asset_not_in?: InputMaybe<Array<Scalars['String']>>;
  asset_not_starts_with?: InputMaybe<Scalars['String']>;
  asset_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  asset_starts_with?: InputMaybe<Scalars['String']>;
  asset_starts_with_nocase?: InputMaybe<Scalars['String']>;
  depositedAt?: InputMaybe<Scalars['BigInt']>;
  depositedAt_gt?: InputMaybe<Scalars['BigInt']>;
  depositedAt_gte?: InputMaybe<Scalars['BigInt']>;
  depositedAt_in?: InputMaybe<Array<Scalars['BigInt']>>;
  depositedAt_lt?: InputMaybe<Scalars['BigInt']>;
  depositedAt_lte?: InputMaybe<Scalars['BigInt']>;
  depositedAt_not?: InputMaybe<Scalars['BigInt']>;
  depositedAt_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  depositor?: InputMaybe<Scalars['String']>;
  depositor_?: InputMaybe<Account_Filter>;
  depositor_contains?: InputMaybe<Scalars['String']>;
  depositor_contains_nocase?: InputMaybe<Scalars['String']>;
  depositor_ends_with?: InputMaybe<Scalars['String']>;
  depositor_ends_with_nocase?: InputMaybe<Scalars['String']>;
  depositor_gt?: InputMaybe<Scalars['String']>;
  depositor_gte?: InputMaybe<Scalars['String']>;
  depositor_in?: InputMaybe<Array<Scalars['String']>>;
  depositor_lt?: InputMaybe<Scalars['String']>;
  depositor_lte?: InputMaybe<Scalars['String']>;
  depositor_not?: InputMaybe<Scalars['String']>;
  depositor_not_contains?: InputMaybe<Scalars['String']>;
  depositor_not_contains_nocase?: InputMaybe<Scalars['String']>;
  depositor_not_ends_with?: InputMaybe<Scalars['String']>;
  depositor_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  depositor_not_in?: InputMaybe<Array<Scalars['String']>>;
  depositor_not_starts_with?: InputMaybe<Scalars['String']>;
  depositor_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  depositor_starts_with?: InputMaybe<Scalars['String']>;
  depositor_starts_with_nocase?: InputMaybe<Scalars['String']>;
  id?: InputMaybe<Scalars['String']>;
  id_contains?: InputMaybe<Scalars['String']>;
  id_contains_nocase?: InputMaybe<Scalars['String']>;
  id_ends_with?: InputMaybe<Scalars['String']>;
  id_ends_with_nocase?: InputMaybe<Scalars['String']>;
  id_gt?: InputMaybe<Scalars['String']>;
  id_gte?: InputMaybe<Scalars['String']>;
  id_in?: InputMaybe<Array<Scalars['String']>>;
  id_lt?: InputMaybe<Scalars['String']>;
  id_lte?: InputMaybe<Scalars['String']>;
  id_not?: InputMaybe<Scalars['String']>;
  id_not_contains?: InputMaybe<Scalars['String']>;
  id_not_contains_nocase?: InputMaybe<Scalars['String']>;
  id_not_ends_with?: InputMaybe<Scalars['String']>;
  id_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  id_not_in?: InputMaybe<Array<Scalars['String']>>;
  id_not_starts_with?: InputMaybe<Scalars['String']>;
  id_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  id_starts_with?: InputMaybe<Scalars['String']>;
  id_starts_with_nocase?: InputMaybe<Scalars['String']>;
  or?: InputMaybe<Array<InputMaybe<Deposit_Filter>>>;
  round?: InputMaybe<Scalars['String']>;
  round_?: InputMaybe<Round_Filter>;
  round_contains?: InputMaybe<Scalars['String']>;
  round_contains_nocase?: InputMaybe<Scalars['String']>;
  round_ends_with?: InputMaybe<Scalars['String']>;
  round_ends_with_nocase?: InputMaybe<Scalars['String']>;
  round_gt?: InputMaybe<Scalars['String']>;
  round_gte?: InputMaybe<Scalars['String']>;
  round_in?: InputMaybe<Array<Scalars['String']>>;
  round_lt?: InputMaybe<Scalars['String']>;
  round_lte?: InputMaybe<Scalars['String']>;
  round_not?: InputMaybe<Scalars['String']>;
  round_not_contains?: InputMaybe<Scalars['String']>;
  round_not_contains_nocase?: InputMaybe<Scalars['String']>;
  round_not_ends_with?: InputMaybe<Scalars['String']>;
  round_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  round_not_in?: InputMaybe<Array<Scalars['String']>>;
  round_not_starts_with?: InputMaybe<Scalars['String']>;
  round_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  round_starts_with?: InputMaybe<Scalars['String']>;
  round_starts_with_nocase?: InputMaybe<Scalars['String']>;
};

export enum Deposit_OrderBy {
  Amount = 'amount',
  Asset = 'asset',
  AssetAssetType = 'asset__assetType',
  AssetId = 'asset__id',
  AssetIdentifier = 'asset__identifier',
  AssetToken = 'asset__token',
  DepositedAt = 'depositedAt',
  Depositor = 'depositor',
  DepositorId = 'depositor__id',
  Id = 'id',
  Round = 'round',
  RoundCreatedAt = 'round__createdAt',
  RoundCreationTx = 'round__creationTx',
  RoundDescription = 'round__description',
  RoundId = 'round__id',
  RoundState = 'round__state',
  RoundTitle = 'round__title',
  RoundType = 'round__type',
}

export type House = {
  __typename?: 'House';
  /** The house metadata URI */
  contractURI?: Maybe<Scalars['String']>;
  /** The unix timestamp when the house was created */
  createdAt: Scalars['BigInt'];
  /** The creation transaction hash */
  creationTx: Scalars['Bytes'];
  /** The account who created the house */
  creator?: Maybe<Account>;
  /** The house description, parsed from the contract URI */
  description?: Maybe<Scalars['String']>;
  /** The address of the house contract */
  id: Scalars['ID'];
  /** The house image URI, parsed from the contract URI */
  imageURI?: Maybe<Scalars['String']>;
  /** The house name, parsed from the contract URI */
  name?: Maybe<Scalars['String']>;
  /** The account who currently owns the house */
  owner?: Maybe<Account>;
  /** All accounts who currently have permission to create rounds on the house (in addition to the owner) */
  roundCreators: Array<RoundCreator>;
  /** All rounds on the house */
  rounds: Array<Round>;
  /** The house type (COMMUNITY) */
  type: Scalars['String'];
};

export type HouseRoundCreatorsArgs = {
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<RoundCreator_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  where?: InputMaybe<RoundCreator_Filter>;
};

export type HouseRoundsArgs = {
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Round_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  where?: InputMaybe<Round_Filter>;
};

export type HouseImplementation = {
  __typename?: 'HouseImplementation';
  /** The administrative entity */
  admin: Administrative;
  /** The address of the house implementation contract */
  id: Scalars['ID'];
  /** Whether the house is currently registered */
  isRegistered: Scalars['Boolean'];
  /** All round implementations registered on the house implementation */
  roundImpls: Array<RoundImplementation>;
  /** The house type (COMMUNITY) */
  type: Scalars['String'];
};

export type HouseImplementationRoundImplsArgs = {
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<RoundImplementation_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  where?: InputMaybe<RoundImplementation_Filter>;
};

export type HouseImplementation_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  admin?: InputMaybe<Scalars['String']>;
  admin_?: InputMaybe<Administrative_Filter>;
  admin_contains?: InputMaybe<Scalars['String']>;
  admin_contains_nocase?: InputMaybe<Scalars['String']>;
  admin_ends_with?: InputMaybe<Scalars['String']>;
  admin_ends_with_nocase?: InputMaybe<Scalars['String']>;
  admin_gt?: InputMaybe<Scalars['String']>;
  admin_gte?: InputMaybe<Scalars['String']>;
  admin_in?: InputMaybe<Array<Scalars['String']>>;
  admin_lt?: InputMaybe<Scalars['String']>;
  admin_lte?: InputMaybe<Scalars['String']>;
  admin_not?: InputMaybe<Scalars['String']>;
  admin_not_contains?: InputMaybe<Scalars['String']>;
  admin_not_contains_nocase?: InputMaybe<Scalars['String']>;
  admin_not_ends_with?: InputMaybe<Scalars['String']>;
  admin_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  admin_not_in?: InputMaybe<Array<Scalars['String']>>;
  admin_not_starts_with?: InputMaybe<Scalars['String']>;
  admin_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  admin_starts_with?: InputMaybe<Scalars['String']>;
  admin_starts_with_nocase?: InputMaybe<Scalars['String']>;
  and?: InputMaybe<Array<InputMaybe<HouseImplementation_Filter>>>;
  id?: InputMaybe<Scalars['ID']>;
  id_gt?: InputMaybe<Scalars['ID']>;
  id_gte?: InputMaybe<Scalars['ID']>;
  id_in?: InputMaybe<Array<Scalars['ID']>>;
  id_lt?: InputMaybe<Scalars['ID']>;
  id_lte?: InputMaybe<Scalars['ID']>;
  id_not?: InputMaybe<Scalars['ID']>;
  id_not_in?: InputMaybe<Array<Scalars['ID']>>;
  isRegistered?: InputMaybe<Scalars['Boolean']>;
  isRegistered_in?: InputMaybe<Array<Scalars['Boolean']>>;
  isRegistered_not?: InputMaybe<Scalars['Boolean']>;
  isRegistered_not_in?: InputMaybe<Array<Scalars['Boolean']>>;
  or?: InputMaybe<Array<InputMaybe<HouseImplementation_Filter>>>;
  roundImpls_?: InputMaybe<RoundImplementation_Filter>;
  type?: InputMaybe<Scalars['String']>;
  type_contains?: InputMaybe<Scalars['String']>;
  type_contains_nocase?: InputMaybe<Scalars['String']>;
  type_ends_with?: InputMaybe<Scalars['String']>;
  type_ends_with_nocase?: InputMaybe<Scalars['String']>;
  type_gt?: InputMaybe<Scalars['String']>;
  type_gte?: InputMaybe<Scalars['String']>;
  type_in?: InputMaybe<Array<Scalars['String']>>;
  type_lt?: InputMaybe<Scalars['String']>;
  type_lte?: InputMaybe<Scalars['String']>;
  type_not?: InputMaybe<Scalars['String']>;
  type_not_contains?: InputMaybe<Scalars['String']>;
  type_not_contains_nocase?: InputMaybe<Scalars['String']>;
  type_not_ends_with?: InputMaybe<Scalars['String']>;
  type_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  type_not_in?: InputMaybe<Array<Scalars['String']>>;
  type_not_starts_with?: InputMaybe<Scalars['String']>;
  type_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  type_starts_with?: InputMaybe<Scalars['String']>;
  type_starts_with_nocase?: InputMaybe<Scalars['String']>;
};

export enum HouseImplementation_OrderBy {
  Admin = 'admin',
  AdminId = 'admin__id',
  AdminManager = 'admin__manager',
  Id = 'id',
  IsRegistered = 'isRegistered',
  RoundImpls = 'roundImpls',
  Type = 'type',
}

export type House_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  and?: InputMaybe<Array<InputMaybe<House_Filter>>>;
  contractURI?: InputMaybe<Scalars['String']>;
  contractURI_contains?: InputMaybe<Scalars['String']>;
  contractURI_contains_nocase?: InputMaybe<Scalars['String']>;
  contractURI_ends_with?: InputMaybe<Scalars['String']>;
  contractURI_ends_with_nocase?: InputMaybe<Scalars['String']>;
  contractURI_gt?: InputMaybe<Scalars['String']>;
  contractURI_gte?: InputMaybe<Scalars['String']>;
  contractURI_in?: InputMaybe<Array<Scalars['String']>>;
  contractURI_lt?: InputMaybe<Scalars['String']>;
  contractURI_lte?: InputMaybe<Scalars['String']>;
  contractURI_not?: InputMaybe<Scalars['String']>;
  contractURI_not_contains?: InputMaybe<Scalars['String']>;
  contractURI_not_contains_nocase?: InputMaybe<Scalars['String']>;
  contractURI_not_ends_with?: InputMaybe<Scalars['String']>;
  contractURI_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  contractURI_not_in?: InputMaybe<Array<Scalars['String']>>;
  contractURI_not_starts_with?: InputMaybe<Scalars['String']>;
  contractURI_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  contractURI_starts_with?: InputMaybe<Scalars['String']>;
  contractURI_starts_with_nocase?: InputMaybe<Scalars['String']>;
  createdAt?: InputMaybe<Scalars['BigInt']>;
  createdAt_gt?: InputMaybe<Scalars['BigInt']>;
  createdAt_gte?: InputMaybe<Scalars['BigInt']>;
  createdAt_in?: InputMaybe<Array<Scalars['BigInt']>>;
  createdAt_lt?: InputMaybe<Scalars['BigInt']>;
  createdAt_lte?: InputMaybe<Scalars['BigInt']>;
  createdAt_not?: InputMaybe<Scalars['BigInt']>;
  createdAt_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  creationTx?: InputMaybe<Scalars['Bytes']>;
  creationTx_contains?: InputMaybe<Scalars['Bytes']>;
  creationTx_gt?: InputMaybe<Scalars['Bytes']>;
  creationTx_gte?: InputMaybe<Scalars['Bytes']>;
  creationTx_in?: InputMaybe<Array<Scalars['Bytes']>>;
  creationTx_lt?: InputMaybe<Scalars['Bytes']>;
  creationTx_lte?: InputMaybe<Scalars['Bytes']>;
  creationTx_not?: InputMaybe<Scalars['Bytes']>;
  creationTx_not_contains?: InputMaybe<Scalars['Bytes']>;
  creationTx_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  creator?: InputMaybe<Scalars['String']>;
  creator_?: InputMaybe<Account_Filter>;
  creator_contains?: InputMaybe<Scalars['String']>;
  creator_contains_nocase?: InputMaybe<Scalars['String']>;
  creator_ends_with?: InputMaybe<Scalars['String']>;
  creator_ends_with_nocase?: InputMaybe<Scalars['String']>;
  creator_gt?: InputMaybe<Scalars['String']>;
  creator_gte?: InputMaybe<Scalars['String']>;
  creator_in?: InputMaybe<Array<Scalars['String']>>;
  creator_lt?: InputMaybe<Scalars['String']>;
  creator_lte?: InputMaybe<Scalars['String']>;
  creator_not?: InputMaybe<Scalars['String']>;
  creator_not_contains?: InputMaybe<Scalars['String']>;
  creator_not_contains_nocase?: InputMaybe<Scalars['String']>;
  creator_not_ends_with?: InputMaybe<Scalars['String']>;
  creator_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  creator_not_in?: InputMaybe<Array<Scalars['String']>>;
  creator_not_starts_with?: InputMaybe<Scalars['String']>;
  creator_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  creator_starts_with?: InputMaybe<Scalars['String']>;
  creator_starts_with_nocase?: InputMaybe<Scalars['String']>;
  description?: InputMaybe<Scalars['String']>;
  description_contains?: InputMaybe<Scalars['String']>;
  description_contains_nocase?: InputMaybe<Scalars['String']>;
  description_ends_with?: InputMaybe<Scalars['String']>;
  description_ends_with_nocase?: InputMaybe<Scalars['String']>;
  description_gt?: InputMaybe<Scalars['String']>;
  description_gte?: InputMaybe<Scalars['String']>;
  description_in?: InputMaybe<Array<Scalars['String']>>;
  description_lt?: InputMaybe<Scalars['String']>;
  description_lte?: InputMaybe<Scalars['String']>;
  description_not?: InputMaybe<Scalars['String']>;
  description_not_contains?: InputMaybe<Scalars['String']>;
  description_not_contains_nocase?: InputMaybe<Scalars['String']>;
  description_not_ends_with?: InputMaybe<Scalars['String']>;
  description_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  description_not_in?: InputMaybe<Array<Scalars['String']>>;
  description_not_starts_with?: InputMaybe<Scalars['String']>;
  description_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  description_starts_with?: InputMaybe<Scalars['String']>;
  description_starts_with_nocase?: InputMaybe<Scalars['String']>;
  id?: InputMaybe<Scalars['ID']>;
  id_gt?: InputMaybe<Scalars['ID']>;
  id_gte?: InputMaybe<Scalars['ID']>;
  id_in?: InputMaybe<Array<Scalars['ID']>>;
  id_lt?: InputMaybe<Scalars['ID']>;
  id_lte?: InputMaybe<Scalars['ID']>;
  id_not?: InputMaybe<Scalars['ID']>;
  id_not_in?: InputMaybe<Array<Scalars['ID']>>;
  imageURI?: InputMaybe<Scalars['String']>;
  imageURI_contains?: InputMaybe<Scalars['String']>;
  imageURI_contains_nocase?: InputMaybe<Scalars['String']>;
  imageURI_ends_with?: InputMaybe<Scalars['String']>;
  imageURI_ends_with_nocase?: InputMaybe<Scalars['String']>;
  imageURI_gt?: InputMaybe<Scalars['String']>;
  imageURI_gte?: InputMaybe<Scalars['String']>;
  imageURI_in?: InputMaybe<Array<Scalars['String']>>;
  imageURI_lt?: InputMaybe<Scalars['String']>;
  imageURI_lte?: InputMaybe<Scalars['String']>;
  imageURI_not?: InputMaybe<Scalars['String']>;
  imageURI_not_contains?: InputMaybe<Scalars['String']>;
  imageURI_not_contains_nocase?: InputMaybe<Scalars['String']>;
  imageURI_not_ends_with?: InputMaybe<Scalars['String']>;
  imageURI_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  imageURI_not_in?: InputMaybe<Array<Scalars['String']>>;
  imageURI_not_starts_with?: InputMaybe<Scalars['String']>;
  imageURI_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  imageURI_starts_with?: InputMaybe<Scalars['String']>;
  imageURI_starts_with_nocase?: InputMaybe<Scalars['String']>;
  name?: InputMaybe<Scalars['String']>;
  name_contains?: InputMaybe<Scalars['String']>;
  name_contains_nocase?: InputMaybe<Scalars['String']>;
  name_ends_with?: InputMaybe<Scalars['String']>;
  name_ends_with_nocase?: InputMaybe<Scalars['String']>;
  name_gt?: InputMaybe<Scalars['String']>;
  name_gte?: InputMaybe<Scalars['String']>;
  name_in?: InputMaybe<Array<Scalars['String']>>;
  name_lt?: InputMaybe<Scalars['String']>;
  name_lte?: InputMaybe<Scalars['String']>;
  name_not?: InputMaybe<Scalars['String']>;
  name_not_contains?: InputMaybe<Scalars['String']>;
  name_not_contains_nocase?: InputMaybe<Scalars['String']>;
  name_not_ends_with?: InputMaybe<Scalars['String']>;
  name_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  name_not_in?: InputMaybe<Array<Scalars['String']>>;
  name_not_starts_with?: InputMaybe<Scalars['String']>;
  name_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  name_starts_with?: InputMaybe<Scalars['String']>;
  name_starts_with_nocase?: InputMaybe<Scalars['String']>;
  or?: InputMaybe<Array<InputMaybe<House_Filter>>>;
  owner?: InputMaybe<Scalars['String']>;
  owner_?: InputMaybe<Account_Filter>;
  owner_contains?: InputMaybe<Scalars['String']>;
  owner_contains_nocase?: InputMaybe<Scalars['String']>;
  owner_ends_with?: InputMaybe<Scalars['String']>;
  owner_ends_with_nocase?: InputMaybe<Scalars['String']>;
  owner_gt?: InputMaybe<Scalars['String']>;
  owner_gte?: InputMaybe<Scalars['String']>;
  owner_in?: InputMaybe<Array<Scalars['String']>>;
  owner_lt?: InputMaybe<Scalars['String']>;
  owner_lte?: InputMaybe<Scalars['String']>;
  owner_not?: InputMaybe<Scalars['String']>;
  owner_not_contains?: InputMaybe<Scalars['String']>;
  owner_not_contains_nocase?: InputMaybe<Scalars['String']>;
  owner_not_ends_with?: InputMaybe<Scalars['String']>;
  owner_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  owner_not_in?: InputMaybe<Array<Scalars['String']>>;
  owner_not_starts_with?: InputMaybe<Scalars['String']>;
  owner_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  owner_starts_with?: InputMaybe<Scalars['String']>;
  owner_starts_with_nocase?: InputMaybe<Scalars['String']>;
  roundCreators_?: InputMaybe<RoundCreator_Filter>;
  rounds_?: InputMaybe<Round_Filter>;
  type?: InputMaybe<Scalars['String']>;
  type_contains?: InputMaybe<Scalars['String']>;
  type_contains_nocase?: InputMaybe<Scalars['String']>;
  type_ends_with?: InputMaybe<Scalars['String']>;
  type_ends_with_nocase?: InputMaybe<Scalars['String']>;
  type_gt?: InputMaybe<Scalars['String']>;
  type_gte?: InputMaybe<Scalars['String']>;
  type_in?: InputMaybe<Array<Scalars['String']>>;
  type_lt?: InputMaybe<Scalars['String']>;
  type_lte?: InputMaybe<Scalars['String']>;
  type_not?: InputMaybe<Scalars['String']>;
  type_not_contains?: InputMaybe<Scalars['String']>;
  type_not_contains_nocase?: InputMaybe<Scalars['String']>;
  type_not_ends_with?: InputMaybe<Scalars['String']>;
  type_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  type_not_in?: InputMaybe<Array<Scalars['String']>>;
  type_not_starts_with?: InputMaybe<Scalars['String']>;
  type_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  type_starts_with?: InputMaybe<Scalars['String']>;
  type_starts_with_nocase?: InputMaybe<Scalars['String']>;
};

export enum House_OrderBy {
  ContractUri = 'contractURI',
  CreatedAt = 'createdAt',
  CreationTx = 'creationTx',
  Creator = 'creator',
  CreatorId = 'creator__id',
  Description = 'description',
  Id = 'id',
  ImageUri = 'imageURI',
  Name = 'name',
  Owner = 'owner',
  OwnerId = 'owner__id',
  RoundCreators = 'roundCreators',
  Rounds = 'rounds',
  Type = 'type',
}

/** Defines the order direction, either ascending or descending */
export enum OrderDirection {
  Asc = 'asc',
  Desc = 'desc',
}

export type Query = {
  __typename?: 'Query';
  /** Access to subgraph metadata */
  _meta?: Maybe<_Meta_>;
  account?: Maybe<Account>;
  accounts: Array<Account>;
  administrative?: Maybe<Administrative>;
  administratives: Array<Administrative>;
  asset?: Maybe<Asset>;
  assets: Array<Asset>;
  award?: Maybe<Award>;
  awards: Array<Award>;
  balance?: Maybe<Balance>;
  balances: Array<Balance>;
  claim?: Maybe<Claim>;
  claims: Array<Claim>;
  deposit?: Maybe<Deposit>;
  deposits: Array<Deposit>;
  house?: Maybe<House>;
  houseImplementation?: Maybe<HouseImplementation>;
  houseImplementations: Array<HouseImplementation>;
  houses: Array<House>;
  reclaim?: Maybe<Reclaim>;
  reclaims: Array<Reclaim>;
  rescue?: Maybe<Rescue>;
  rescues: Array<Rescue>;
  round?: Maybe<Round>;
  roundCreator?: Maybe<RoundCreator>;
  roundCreators: Array<RoundCreator>;
  roundImplementation?: Maybe<RoundImplementation>;
  roundImplementations: Array<RoundImplementation>;
  roundVotingStrategies: Array<RoundVotingStrategy>;
  roundVotingStrategy?: Maybe<RoundVotingStrategy>;
  rounds: Array<Round>;
  timedFundingRoundConfig?: Maybe<TimedFundingRoundConfig>;
  timedFundingRoundConfigs: Array<TimedFundingRoundConfig>;
  transfer?: Maybe<Transfer>;
  transfers: Array<Transfer>;
  votingStrategies: Array<VotingStrategy>;
  votingStrategy?: Maybe<VotingStrategy>;
};

export type Query_MetaArgs = {
  block?: InputMaybe<Block_Height>;
};

export type QueryAccountArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};

export type QueryAccountsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Account_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<Account_Filter>;
};

export type QueryAdministrativeArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};

export type QueryAdministrativesArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Administrative_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<Administrative_Filter>;
};

export type QueryAssetArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};

export type QueryAssetsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Asset_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<Asset_Filter>;
};

export type QueryAwardArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};

export type QueryAwardsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Award_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<Award_Filter>;
};

export type QueryBalanceArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};

export type QueryBalancesArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Balance_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<Balance_Filter>;
};

export type QueryClaimArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};

export type QueryClaimsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Claim_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<Claim_Filter>;
};

export type QueryDepositArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};

export type QueryDepositsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Deposit_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<Deposit_Filter>;
};

export type QueryHouseArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};

export type QueryHouseImplementationArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};

export type QueryHouseImplementationsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<HouseImplementation_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<HouseImplementation_Filter>;
};

export type QueryHousesArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<House_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<House_Filter>;
};

export type QueryReclaimArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};

export type QueryReclaimsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Reclaim_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<Reclaim_Filter>;
};

export type QueryRescueArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};

export type QueryRescuesArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Rescue_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<Rescue_Filter>;
};

export type QueryRoundArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};

export type QueryRoundCreatorArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};

export type QueryRoundCreatorsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<RoundCreator_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<RoundCreator_Filter>;
};

export type QueryRoundImplementationArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};

export type QueryRoundImplementationsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<RoundImplementation_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<RoundImplementation_Filter>;
};

export type QueryRoundVotingStrategiesArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<RoundVotingStrategy_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<RoundVotingStrategy_Filter>;
};

export type QueryRoundVotingStrategyArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};

export type QueryRoundsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Round_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<Round_Filter>;
};

export type QueryTimedFundingRoundConfigArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};

export type QueryTimedFundingRoundConfigsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<TimedFundingRoundConfig_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<TimedFundingRoundConfig_Filter>;
};

export type QueryTransferArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};

export type QueryTransfersArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Transfer_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<Transfer_Filter>;
};

export type QueryVotingStrategiesArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<VotingStrategy_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<VotingStrategy_Filter>;
};

export type QueryVotingStrategyArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};

export type Reclaim = {
  __typename?: 'Reclaim';
  /** The reclamation amount */
  amount: Scalars['BigInt'];
  /** The asset that was reclaimed */
  asset: Asset;
  /** A concatenation of the reclamation tx hash and the the event log index */
  id: Scalars['String'];
  /** The unix timestamp when this reclamation was performed */
  reclaimedAt: Scalars['BigInt'];
  /** The account who reclaimed the asset */
  reclaimer: Account;
  /** The round that the asset was reclaimed from */
  round: Round;
};

export type Reclaim_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  amount?: InputMaybe<Scalars['BigInt']>;
  amount_gt?: InputMaybe<Scalars['BigInt']>;
  amount_gte?: InputMaybe<Scalars['BigInt']>;
  amount_in?: InputMaybe<Array<Scalars['BigInt']>>;
  amount_lt?: InputMaybe<Scalars['BigInt']>;
  amount_lte?: InputMaybe<Scalars['BigInt']>;
  amount_not?: InputMaybe<Scalars['BigInt']>;
  amount_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  and?: InputMaybe<Array<InputMaybe<Reclaim_Filter>>>;
  asset?: InputMaybe<Scalars['String']>;
  asset_?: InputMaybe<Asset_Filter>;
  asset_contains?: InputMaybe<Scalars['String']>;
  asset_contains_nocase?: InputMaybe<Scalars['String']>;
  asset_ends_with?: InputMaybe<Scalars['String']>;
  asset_ends_with_nocase?: InputMaybe<Scalars['String']>;
  asset_gt?: InputMaybe<Scalars['String']>;
  asset_gte?: InputMaybe<Scalars['String']>;
  asset_in?: InputMaybe<Array<Scalars['String']>>;
  asset_lt?: InputMaybe<Scalars['String']>;
  asset_lte?: InputMaybe<Scalars['String']>;
  asset_not?: InputMaybe<Scalars['String']>;
  asset_not_contains?: InputMaybe<Scalars['String']>;
  asset_not_contains_nocase?: InputMaybe<Scalars['String']>;
  asset_not_ends_with?: InputMaybe<Scalars['String']>;
  asset_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  asset_not_in?: InputMaybe<Array<Scalars['String']>>;
  asset_not_starts_with?: InputMaybe<Scalars['String']>;
  asset_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  asset_starts_with?: InputMaybe<Scalars['String']>;
  asset_starts_with_nocase?: InputMaybe<Scalars['String']>;
  id?: InputMaybe<Scalars['String']>;
  id_contains?: InputMaybe<Scalars['String']>;
  id_contains_nocase?: InputMaybe<Scalars['String']>;
  id_ends_with?: InputMaybe<Scalars['String']>;
  id_ends_with_nocase?: InputMaybe<Scalars['String']>;
  id_gt?: InputMaybe<Scalars['String']>;
  id_gte?: InputMaybe<Scalars['String']>;
  id_in?: InputMaybe<Array<Scalars['String']>>;
  id_lt?: InputMaybe<Scalars['String']>;
  id_lte?: InputMaybe<Scalars['String']>;
  id_not?: InputMaybe<Scalars['String']>;
  id_not_contains?: InputMaybe<Scalars['String']>;
  id_not_contains_nocase?: InputMaybe<Scalars['String']>;
  id_not_ends_with?: InputMaybe<Scalars['String']>;
  id_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  id_not_in?: InputMaybe<Array<Scalars['String']>>;
  id_not_starts_with?: InputMaybe<Scalars['String']>;
  id_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  id_starts_with?: InputMaybe<Scalars['String']>;
  id_starts_with_nocase?: InputMaybe<Scalars['String']>;
  or?: InputMaybe<Array<InputMaybe<Reclaim_Filter>>>;
  reclaimedAt?: InputMaybe<Scalars['BigInt']>;
  reclaimedAt_gt?: InputMaybe<Scalars['BigInt']>;
  reclaimedAt_gte?: InputMaybe<Scalars['BigInt']>;
  reclaimedAt_in?: InputMaybe<Array<Scalars['BigInt']>>;
  reclaimedAt_lt?: InputMaybe<Scalars['BigInt']>;
  reclaimedAt_lte?: InputMaybe<Scalars['BigInt']>;
  reclaimedAt_not?: InputMaybe<Scalars['BigInt']>;
  reclaimedAt_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  reclaimer?: InputMaybe<Scalars['String']>;
  reclaimer_?: InputMaybe<Account_Filter>;
  reclaimer_contains?: InputMaybe<Scalars['String']>;
  reclaimer_contains_nocase?: InputMaybe<Scalars['String']>;
  reclaimer_ends_with?: InputMaybe<Scalars['String']>;
  reclaimer_ends_with_nocase?: InputMaybe<Scalars['String']>;
  reclaimer_gt?: InputMaybe<Scalars['String']>;
  reclaimer_gte?: InputMaybe<Scalars['String']>;
  reclaimer_in?: InputMaybe<Array<Scalars['String']>>;
  reclaimer_lt?: InputMaybe<Scalars['String']>;
  reclaimer_lte?: InputMaybe<Scalars['String']>;
  reclaimer_not?: InputMaybe<Scalars['String']>;
  reclaimer_not_contains?: InputMaybe<Scalars['String']>;
  reclaimer_not_contains_nocase?: InputMaybe<Scalars['String']>;
  reclaimer_not_ends_with?: InputMaybe<Scalars['String']>;
  reclaimer_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  reclaimer_not_in?: InputMaybe<Array<Scalars['String']>>;
  reclaimer_not_starts_with?: InputMaybe<Scalars['String']>;
  reclaimer_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  reclaimer_starts_with?: InputMaybe<Scalars['String']>;
  reclaimer_starts_with_nocase?: InputMaybe<Scalars['String']>;
  round?: InputMaybe<Scalars['String']>;
  round_?: InputMaybe<Round_Filter>;
  round_contains?: InputMaybe<Scalars['String']>;
  round_contains_nocase?: InputMaybe<Scalars['String']>;
  round_ends_with?: InputMaybe<Scalars['String']>;
  round_ends_with_nocase?: InputMaybe<Scalars['String']>;
  round_gt?: InputMaybe<Scalars['String']>;
  round_gte?: InputMaybe<Scalars['String']>;
  round_in?: InputMaybe<Array<Scalars['String']>>;
  round_lt?: InputMaybe<Scalars['String']>;
  round_lte?: InputMaybe<Scalars['String']>;
  round_not?: InputMaybe<Scalars['String']>;
  round_not_contains?: InputMaybe<Scalars['String']>;
  round_not_contains_nocase?: InputMaybe<Scalars['String']>;
  round_not_ends_with?: InputMaybe<Scalars['String']>;
  round_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  round_not_in?: InputMaybe<Array<Scalars['String']>>;
  round_not_starts_with?: InputMaybe<Scalars['String']>;
  round_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  round_starts_with?: InputMaybe<Scalars['String']>;
  round_starts_with_nocase?: InputMaybe<Scalars['String']>;
};

export enum Reclaim_OrderBy {
  Amount = 'amount',
  Asset = 'asset',
  AssetAssetType = 'asset__assetType',
  AssetId = 'asset__id',
  AssetIdentifier = 'asset__identifier',
  AssetToken = 'asset__token',
  Id = 'id',
  ReclaimedAt = 'reclaimedAt',
  Reclaimer = 'reclaimer',
  ReclaimerId = 'reclaimer__id',
  Round = 'round',
  RoundCreatedAt = 'round__createdAt',
  RoundCreationTx = 'round__creationTx',
  RoundDescription = 'round__description',
  RoundId = 'round__id',
  RoundState = 'round__state',
  RoundTitle = 'round__title',
  RoundType = 'round__type',
}

export type Rescue = {
  __typename?: 'Rescue';
  /** The rescue amount */
  amount: Scalars['BigInt'];
  /** The asset that was rescued */
  asset: Asset;
  /** A concatenation of the rescue tx hash and the the event log index */
  id: Scalars['String'];
  /** The recipient of the rescued asset */
  recipient: Scalars['Bytes'];
  /** The unix timestamp when this rescue was performed */
  rescuedAt: Scalars['BigInt'];
  /** The account who rescued the asset */
  rescuer: Account;
  /** The round that the asset was rescued from */
  round: Round;
};

export type Rescue_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  amount?: InputMaybe<Scalars['BigInt']>;
  amount_gt?: InputMaybe<Scalars['BigInt']>;
  amount_gte?: InputMaybe<Scalars['BigInt']>;
  amount_in?: InputMaybe<Array<Scalars['BigInt']>>;
  amount_lt?: InputMaybe<Scalars['BigInt']>;
  amount_lte?: InputMaybe<Scalars['BigInt']>;
  amount_not?: InputMaybe<Scalars['BigInt']>;
  amount_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  and?: InputMaybe<Array<InputMaybe<Rescue_Filter>>>;
  asset?: InputMaybe<Scalars['String']>;
  asset_?: InputMaybe<Asset_Filter>;
  asset_contains?: InputMaybe<Scalars['String']>;
  asset_contains_nocase?: InputMaybe<Scalars['String']>;
  asset_ends_with?: InputMaybe<Scalars['String']>;
  asset_ends_with_nocase?: InputMaybe<Scalars['String']>;
  asset_gt?: InputMaybe<Scalars['String']>;
  asset_gte?: InputMaybe<Scalars['String']>;
  asset_in?: InputMaybe<Array<Scalars['String']>>;
  asset_lt?: InputMaybe<Scalars['String']>;
  asset_lte?: InputMaybe<Scalars['String']>;
  asset_not?: InputMaybe<Scalars['String']>;
  asset_not_contains?: InputMaybe<Scalars['String']>;
  asset_not_contains_nocase?: InputMaybe<Scalars['String']>;
  asset_not_ends_with?: InputMaybe<Scalars['String']>;
  asset_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  asset_not_in?: InputMaybe<Array<Scalars['String']>>;
  asset_not_starts_with?: InputMaybe<Scalars['String']>;
  asset_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  asset_starts_with?: InputMaybe<Scalars['String']>;
  asset_starts_with_nocase?: InputMaybe<Scalars['String']>;
  id?: InputMaybe<Scalars['String']>;
  id_contains?: InputMaybe<Scalars['String']>;
  id_contains_nocase?: InputMaybe<Scalars['String']>;
  id_ends_with?: InputMaybe<Scalars['String']>;
  id_ends_with_nocase?: InputMaybe<Scalars['String']>;
  id_gt?: InputMaybe<Scalars['String']>;
  id_gte?: InputMaybe<Scalars['String']>;
  id_in?: InputMaybe<Array<Scalars['String']>>;
  id_lt?: InputMaybe<Scalars['String']>;
  id_lte?: InputMaybe<Scalars['String']>;
  id_not?: InputMaybe<Scalars['String']>;
  id_not_contains?: InputMaybe<Scalars['String']>;
  id_not_contains_nocase?: InputMaybe<Scalars['String']>;
  id_not_ends_with?: InputMaybe<Scalars['String']>;
  id_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  id_not_in?: InputMaybe<Array<Scalars['String']>>;
  id_not_starts_with?: InputMaybe<Scalars['String']>;
  id_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  id_starts_with?: InputMaybe<Scalars['String']>;
  id_starts_with_nocase?: InputMaybe<Scalars['String']>;
  or?: InputMaybe<Array<InputMaybe<Rescue_Filter>>>;
  recipient?: InputMaybe<Scalars['Bytes']>;
  recipient_contains?: InputMaybe<Scalars['Bytes']>;
  recipient_gt?: InputMaybe<Scalars['Bytes']>;
  recipient_gte?: InputMaybe<Scalars['Bytes']>;
  recipient_in?: InputMaybe<Array<Scalars['Bytes']>>;
  recipient_lt?: InputMaybe<Scalars['Bytes']>;
  recipient_lte?: InputMaybe<Scalars['Bytes']>;
  recipient_not?: InputMaybe<Scalars['Bytes']>;
  recipient_not_contains?: InputMaybe<Scalars['Bytes']>;
  recipient_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  rescuedAt?: InputMaybe<Scalars['BigInt']>;
  rescuedAt_gt?: InputMaybe<Scalars['BigInt']>;
  rescuedAt_gte?: InputMaybe<Scalars['BigInt']>;
  rescuedAt_in?: InputMaybe<Array<Scalars['BigInt']>>;
  rescuedAt_lt?: InputMaybe<Scalars['BigInt']>;
  rescuedAt_lte?: InputMaybe<Scalars['BigInt']>;
  rescuedAt_not?: InputMaybe<Scalars['BigInt']>;
  rescuedAt_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  rescuer?: InputMaybe<Scalars['String']>;
  rescuer_?: InputMaybe<Account_Filter>;
  rescuer_contains?: InputMaybe<Scalars['String']>;
  rescuer_contains_nocase?: InputMaybe<Scalars['String']>;
  rescuer_ends_with?: InputMaybe<Scalars['String']>;
  rescuer_ends_with_nocase?: InputMaybe<Scalars['String']>;
  rescuer_gt?: InputMaybe<Scalars['String']>;
  rescuer_gte?: InputMaybe<Scalars['String']>;
  rescuer_in?: InputMaybe<Array<Scalars['String']>>;
  rescuer_lt?: InputMaybe<Scalars['String']>;
  rescuer_lte?: InputMaybe<Scalars['String']>;
  rescuer_not?: InputMaybe<Scalars['String']>;
  rescuer_not_contains?: InputMaybe<Scalars['String']>;
  rescuer_not_contains_nocase?: InputMaybe<Scalars['String']>;
  rescuer_not_ends_with?: InputMaybe<Scalars['String']>;
  rescuer_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  rescuer_not_in?: InputMaybe<Array<Scalars['String']>>;
  rescuer_not_starts_with?: InputMaybe<Scalars['String']>;
  rescuer_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  rescuer_starts_with?: InputMaybe<Scalars['String']>;
  rescuer_starts_with_nocase?: InputMaybe<Scalars['String']>;
  round?: InputMaybe<Scalars['String']>;
  round_?: InputMaybe<Round_Filter>;
  round_contains?: InputMaybe<Scalars['String']>;
  round_contains_nocase?: InputMaybe<Scalars['String']>;
  round_ends_with?: InputMaybe<Scalars['String']>;
  round_ends_with_nocase?: InputMaybe<Scalars['String']>;
  round_gt?: InputMaybe<Scalars['String']>;
  round_gte?: InputMaybe<Scalars['String']>;
  round_in?: InputMaybe<Array<Scalars['String']>>;
  round_lt?: InputMaybe<Scalars['String']>;
  round_lte?: InputMaybe<Scalars['String']>;
  round_not?: InputMaybe<Scalars['String']>;
  round_not_contains?: InputMaybe<Scalars['String']>;
  round_not_contains_nocase?: InputMaybe<Scalars['String']>;
  round_not_ends_with?: InputMaybe<Scalars['String']>;
  round_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  round_not_in?: InputMaybe<Array<Scalars['String']>>;
  round_not_starts_with?: InputMaybe<Scalars['String']>;
  round_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  round_starts_with?: InputMaybe<Scalars['String']>;
  round_starts_with_nocase?: InputMaybe<Scalars['String']>;
};

export enum Rescue_OrderBy {
  Amount = 'amount',
  Asset = 'asset',
  AssetAssetType = 'asset__assetType',
  AssetId = 'asset__id',
  AssetIdentifier = 'asset__identifier',
  AssetToken = 'asset__token',
  Id = 'id',
  Recipient = 'recipient',
  RescuedAt = 'rescuedAt',
  Rescuer = 'rescuer',
  RescuerId = 'rescuer__id',
  Round = 'round',
  RoundCreatedAt = 'round__createdAt',
  RoundCreationTx = 'round__creationTx',
  RoundDescription = 'round__description',
  RoundId = 'round__id',
  RoundState = 'round__state',
  RoundTitle = 'round__title',
  RoundType = 'round__type',
}

export type Round = {
  __typename?: 'Round';
  /** Up-to-date round balances */
  balances: Array<Balance>;
  /** All round award claims */
  claims: Array<Claim>;
  /** The unix timestamp when the round was created */
  createdAt: Scalars['BigInt'];
  /** The creation transaction hash */
  creationTx: Scalars['Bytes'];
  /** The account who created the round */
  creator?: Maybe<Account>;
  /** All round asset deposits */
  deposits: Array<Deposit>;
  /** The round description */
  description: Scalars['String'];
  /** The house that the round belongs to */
  house: House;
  /** The address of the round contract */
  id: Scalars['ID'];
  /** The round manager */
  manager?: Maybe<Account>;
  /** All round asset reclamations */
  reclamations?: Maybe<Array<Reclaim>>;
  /** All round asset rescues */
  rescues: Array<Rescue>;
  /** The round state */
  state: RoundState;
  /** The configuration for a timed funding round (Null if type != TIMED_FUNDING) */
  timedFundingConfig?: Maybe<TimedFundingRoundConfig>;
  /** The round title */
  title: Scalars['String'];
  /** All round asset receipt transfers */
  transfers: Array<Transfer>;
  /** The round type (TIMED_FUNDING) */
  type: Scalars['String'];
  /** The selected voting strategies */
  votingStrategies: Array<RoundVotingStrategy>;
};

export type RoundBalancesArgs = {
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Balance_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  where?: InputMaybe<Balance_Filter>;
};

export type RoundClaimsArgs = {
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Claim_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  where?: InputMaybe<Claim_Filter>;
};

export type RoundDepositsArgs = {
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Deposit_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  where?: InputMaybe<Deposit_Filter>;
};

export type RoundReclamationsArgs = {
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Reclaim_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  where?: InputMaybe<Reclaim_Filter>;
};

export type RoundRescuesArgs = {
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Rescue_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  where?: InputMaybe<Rescue_Filter>;
};

export type RoundTransfersArgs = {
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Transfer_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  where?: InputMaybe<Transfer_Filter>;
};

export type RoundVotingStrategiesArgs = {
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<RoundVotingStrategy_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  where?: InputMaybe<RoundVotingStrategy_Filter>;
};

export type RoundCreator = {
  __typename?: 'RoundCreator';
  /** The creator account */
  creator: Account;
  /** The house that the creator belongs to */
  house: House;
  /** A concatenation of the house address and creator account id */
  id: Scalars['ID'];
  /** The number of passes that the creator holds */
  passCount: Scalars['Int'];
};

export type RoundCreator_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  and?: InputMaybe<Array<InputMaybe<RoundCreator_Filter>>>;
  creator?: InputMaybe<Scalars['String']>;
  creator_?: InputMaybe<Account_Filter>;
  creator_contains?: InputMaybe<Scalars['String']>;
  creator_contains_nocase?: InputMaybe<Scalars['String']>;
  creator_ends_with?: InputMaybe<Scalars['String']>;
  creator_ends_with_nocase?: InputMaybe<Scalars['String']>;
  creator_gt?: InputMaybe<Scalars['String']>;
  creator_gte?: InputMaybe<Scalars['String']>;
  creator_in?: InputMaybe<Array<Scalars['String']>>;
  creator_lt?: InputMaybe<Scalars['String']>;
  creator_lte?: InputMaybe<Scalars['String']>;
  creator_not?: InputMaybe<Scalars['String']>;
  creator_not_contains?: InputMaybe<Scalars['String']>;
  creator_not_contains_nocase?: InputMaybe<Scalars['String']>;
  creator_not_ends_with?: InputMaybe<Scalars['String']>;
  creator_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  creator_not_in?: InputMaybe<Array<Scalars['String']>>;
  creator_not_starts_with?: InputMaybe<Scalars['String']>;
  creator_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  creator_starts_with?: InputMaybe<Scalars['String']>;
  creator_starts_with_nocase?: InputMaybe<Scalars['String']>;
  house?: InputMaybe<Scalars['String']>;
  house_?: InputMaybe<House_Filter>;
  house_contains?: InputMaybe<Scalars['String']>;
  house_contains_nocase?: InputMaybe<Scalars['String']>;
  house_ends_with?: InputMaybe<Scalars['String']>;
  house_ends_with_nocase?: InputMaybe<Scalars['String']>;
  house_gt?: InputMaybe<Scalars['String']>;
  house_gte?: InputMaybe<Scalars['String']>;
  house_in?: InputMaybe<Array<Scalars['String']>>;
  house_lt?: InputMaybe<Scalars['String']>;
  house_lte?: InputMaybe<Scalars['String']>;
  house_not?: InputMaybe<Scalars['String']>;
  house_not_contains?: InputMaybe<Scalars['String']>;
  house_not_contains_nocase?: InputMaybe<Scalars['String']>;
  house_not_ends_with?: InputMaybe<Scalars['String']>;
  house_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  house_not_in?: InputMaybe<Array<Scalars['String']>>;
  house_not_starts_with?: InputMaybe<Scalars['String']>;
  house_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  house_starts_with?: InputMaybe<Scalars['String']>;
  house_starts_with_nocase?: InputMaybe<Scalars['String']>;
  id?: InputMaybe<Scalars['ID']>;
  id_gt?: InputMaybe<Scalars['ID']>;
  id_gte?: InputMaybe<Scalars['ID']>;
  id_in?: InputMaybe<Array<Scalars['ID']>>;
  id_lt?: InputMaybe<Scalars['ID']>;
  id_lte?: InputMaybe<Scalars['ID']>;
  id_not?: InputMaybe<Scalars['ID']>;
  id_not_in?: InputMaybe<Array<Scalars['ID']>>;
  or?: InputMaybe<Array<InputMaybe<RoundCreator_Filter>>>;
  passCount?: InputMaybe<Scalars['Int']>;
  passCount_gt?: InputMaybe<Scalars['Int']>;
  passCount_gte?: InputMaybe<Scalars['Int']>;
  passCount_in?: InputMaybe<Array<Scalars['Int']>>;
  passCount_lt?: InputMaybe<Scalars['Int']>;
  passCount_lte?: InputMaybe<Scalars['Int']>;
  passCount_not?: InputMaybe<Scalars['Int']>;
  passCount_not_in?: InputMaybe<Array<Scalars['Int']>>;
};

export enum RoundCreator_OrderBy {
  Creator = 'creator',
  CreatorId = 'creator__id',
  House = 'house',
  HouseContractUri = 'house__contractURI',
  HouseCreatedAt = 'house__createdAt',
  HouseCreationTx = 'house__creationTx',
  HouseDescription = 'house__description',
  HouseId = 'house__id',
  HouseImageUri = 'house__imageURI',
  HouseName = 'house__name',
  HouseType = 'house__type',
  Id = 'id',
  PassCount = 'passCount',
}

export type RoundImplementation = {
  __typename?: 'RoundImplementation';
  /** The house implementation that the round is registered upon */
  houseImpl: HouseImplementation;
  /** A concatenation of the house and round implementation contracts */
  id: Scalars['ID'];
  /** Whether the round is currently registered */
  isRegistered: Scalars['Boolean'];
  /** The round type (TIMED_FUNDING) */
  type: Scalars['String'];
};

export type RoundImplementation_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  and?: InputMaybe<Array<InputMaybe<RoundImplementation_Filter>>>;
  houseImpl?: InputMaybe<Scalars['String']>;
  houseImpl_?: InputMaybe<HouseImplementation_Filter>;
  houseImpl_contains?: InputMaybe<Scalars['String']>;
  houseImpl_contains_nocase?: InputMaybe<Scalars['String']>;
  houseImpl_ends_with?: InputMaybe<Scalars['String']>;
  houseImpl_ends_with_nocase?: InputMaybe<Scalars['String']>;
  houseImpl_gt?: InputMaybe<Scalars['String']>;
  houseImpl_gte?: InputMaybe<Scalars['String']>;
  houseImpl_in?: InputMaybe<Array<Scalars['String']>>;
  houseImpl_lt?: InputMaybe<Scalars['String']>;
  houseImpl_lte?: InputMaybe<Scalars['String']>;
  houseImpl_not?: InputMaybe<Scalars['String']>;
  houseImpl_not_contains?: InputMaybe<Scalars['String']>;
  houseImpl_not_contains_nocase?: InputMaybe<Scalars['String']>;
  houseImpl_not_ends_with?: InputMaybe<Scalars['String']>;
  houseImpl_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  houseImpl_not_in?: InputMaybe<Array<Scalars['String']>>;
  houseImpl_not_starts_with?: InputMaybe<Scalars['String']>;
  houseImpl_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  houseImpl_starts_with?: InputMaybe<Scalars['String']>;
  houseImpl_starts_with_nocase?: InputMaybe<Scalars['String']>;
  id?: InputMaybe<Scalars['ID']>;
  id_gt?: InputMaybe<Scalars['ID']>;
  id_gte?: InputMaybe<Scalars['ID']>;
  id_in?: InputMaybe<Array<Scalars['ID']>>;
  id_lt?: InputMaybe<Scalars['ID']>;
  id_lte?: InputMaybe<Scalars['ID']>;
  id_not?: InputMaybe<Scalars['ID']>;
  id_not_in?: InputMaybe<Array<Scalars['ID']>>;
  isRegistered?: InputMaybe<Scalars['Boolean']>;
  isRegistered_in?: InputMaybe<Array<Scalars['Boolean']>>;
  isRegistered_not?: InputMaybe<Scalars['Boolean']>;
  isRegistered_not_in?: InputMaybe<Array<Scalars['Boolean']>>;
  or?: InputMaybe<Array<InputMaybe<RoundImplementation_Filter>>>;
  type?: InputMaybe<Scalars['String']>;
  type_contains?: InputMaybe<Scalars['String']>;
  type_contains_nocase?: InputMaybe<Scalars['String']>;
  type_ends_with?: InputMaybe<Scalars['String']>;
  type_ends_with_nocase?: InputMaybe<Scalars['String']>;
  type_gt?: InputMaybe<Scalars['String']>;
  type_gte?: InputMaybe<Scalars['String']>;
  type_in?: InputMaybe<Array<Scalars['String']>>;
  type_lt?: InputMaybe<Scalars['String']>;
  type_lte?: InputMaybe<Scalars['String']>;
  type_not?: InputMaybe<Scalars['String']>;
  type_not_contains?: InputMaybe<Scalars['String']>;
  type_not_contains_nocase?: InputMaybe<Scalars['String']>;
  type_not_ends_with?: InputMaybe<Scalars['String']>;
  type_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  type_not_in?: InputMaybe<Array<Scalars['String']>>;
  type_not_starts_with?: InputMaybe<Scalars['String']>;
  type_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  type_starts_with?: InputMaybe<Scalars['String']>;
  type_starts_with_nocase?: InputMaybe<Scalars['String']>;
};

export enum RoundImplementation_OrderBy {
  HouseImpl = 'houseImpl',
  HouseImplId = 'houseImpl__id',
  HouseImplIsRegistered = 'houseImpl__isRegistered',
  HouseImplType = 'houseImpl__type',
  Id = 'id',
  IsRegistered = 'isRegistered',
  Type = 'type',
}

export enum RoundState {
  AwaitingRegistration = 'AWAITING_REGISTRATION',
  Cancelled = 'CANCELLED',
  Finalized = 'FINALIZED',
  Registered = 'REGISTERED',
}

export type RoundVotingStrategy = {
  __typename?: 'RoundVotingStrategy';
  /** A concatenation of the round address and strategy ID */
  id: Scalars['ID'];
  /** The round that the voting strategy belongs to */
  round: Round;
  /** The voting strategy */
  votingStrategy: VotingStrategy;
};

export type RoundVotingStrategy_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  and?: InputMaybe<Array<InputMaybe<RoundVotingStrategy_Filter>>>;
  id?: InputMaybe<Scalars['ID']>;
  id_gt?: InputMaybe<Scalars['ID']>;
  id_gte?: InputMaybe<Scalars['ID']>;
  id_in?: InputMaybe<Array<Scalars['ID']>>;
  id_lt?: InputMaybe<Scalars['ID']>;
  id_lte?: InputMaybe<Scalars['ID']>;
  id_not?: InputMaybe<Scalars['ID']>;
  id_not_in?: InputMaybe<Array<Scalars['ID']>>;
  or?: InputMaybe<Array<InputMaybe<RoundVotingStrategy_Filter>>>;
  round?: InputMaybe<Scalars['String']>;
  round_?: InputMaybe<Round_Filter>;
  round_contains?: InputMaybe<Scalars['String']>;
  round_contains_nocase?: InputMaybe<Scalars['String']>;
  round_ends_with?: InputMaybe<Scalars['String']>;
  round_ends_with_nocase?: InputMaybe<Scalars['String']>;
  round_gt?: InputMaybe<Scalars['String']>;
  round_gte?: InputMaybe<Scalars['String']>;
  round_in?: InputMaybe<Array<Scalars['String']>>;
  round_lt?: InputMaybe<Scalars['String']>;
  round_lte?: InputMaybe<Scalars['String']>;
  round_not?: InputMaybe<Scalars['String']>;
  round_not_contains?: InputMaybe<Scalars['String']>;
  round_not_contains_nocase?: InputMaybe<Scalars['String']>;
  round_not_ends_with?: InputMaybe<Scalars['String']>;
  round_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  round_not_in?: InputMaybe<Array<Scalars['String']>>;
  round_not_starts_with?: InputMaybe<Scalars['String']>;
  round_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  round_starts_with?: InputMaybe<Scalars['String']>;
  round_starts_with_nocase?: InputMaybe<Scalars['String']>;
  votingStrategy?: InputMaybe<Scalars['String']>;
  votingStrategy_?: InputMaybe<VotingStrategy_Filter>;
  votingStrategy_contains?: InputMaybe<Scalars['String']>;
  votingStrategy_contains_nocase?: InputMaybe<Scalars['String']>;
  votingStrategy_ends_with?: InputMaybe<Scalars['String']>;
  votingStrategy_ends_with_nocase?: InputMaybe<Scalars['String']>;
  votingStrategy_gt?: InputMaybe<Scalars['String']>;
  votingStrategy_gte?: InputMaybe<Scalars['String']>;
  votingStrategy_in?: InputMaybe<Array<Scalars['String']>>;
  votingStrategy_lt?: InputMaybe<Scalars['String']>;
  votingStrategy_lte?: InputMaybe<Scalars['String']>;
  votingStrategy_not?: InputMaybe<Scalars['String']>;
  votingStrategy_not_contains?: InputMaybe<Scalars['String']>;
  votingStrategy_not_contains_nocase?: InputMaybe<Scalars['String']>;
  votingStrategy_not_ends_with?: InputMaybe<Scalars['String']>;
  votingStrategy_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  votingStrategy_not_in?: InputMaybe<Array<Scalars['String']>>;
  votingStrategy_not_starts_with?: InputMaybe<Scalars['String']>;
  votingStrategy_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  votingStrategy_starts_with?: InputMaybe<Scalars['String']>;
  votingStrategy_starts_with_nocase?: InputMaybe<Scalars['String']>;
};

export enum RoundVotingStrategy_OrderBy {
  Id = 'id',
  Round = 'round',
  RoundCreatedAt = 'round__createdAt',
  RoundCreationTx = 'round__creationTx',
  RoundDescription = 'round__description',
  RoundId = 'round__id',
  RoundState = 'round__state',
  RoundTitle = 'round__title',
  RoundType = 'round__type',
  VotingStrategy = 'votingStrategy',
  VotingStrategyAddress = 'votingStrategy__address',
  VotingStrategyId = 'votingStrategy__id',
  VotingStrategyType = 'votingStrategy__type',
}

export type Round_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  and?: InputMaybe<Array<InputMaybe<Round_Filter>>>;
  balances_?: InputMaybe<Balance_Filter>;
  claims_?: InputMaybe<Claim_Filter>;
  createdAt?: InputMaybe<Scalars['BigInt']>;
  createdAt_gt?: InputMaybe<Scalars['BigInt']>;
  createdAt_gte?: InputMaybe<Scalars['BigInt']>;
  createdAt_in?: InputMaybe<Array<Scalars['BigInt']>>;
  createdAt_lt?: InputMaybe<Scalars['BigInt']>;
  createdAt_lte?: InputMaybe<Scalars['BigInt']>;
  createdAt_not?: InputMaybe<Scalars['BigInt']>;
  createdAt_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  creationTx?: InputMaybe<Scalars['Bytes']>;
  creationTx_contains?: InputMaybe<Scalars['Bytes']>;
  creationTx_gt?: InputMaybe<Scalars['Bytes']>;
  creationTx_gte?: InputMaybe<Scalars['Bytes']>;
  creationTx_in?: InputMaybe<Array<Scalars['Bytes']>>;
  creationTx_lt?: InputMaybe<Scalars['Bytes']>;
  creationTx_lte?: InputMaybe<Scalars['Bytes']>;
  creationTx_not?: InputMaybe<Scalars['Bytes']>;
  creationTx_not_contains?: InputMaybe<Scalars['Bytes']>;
  creationTx_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  creator?: InputMaybe<Scalars['String']>;
  creator_?: InputMaybe<Account_Filter>;
  creator_contains?: InputMaybe<Scalars['String']>;
  creator_contains_nocase?: InputMaybe<Scalars['String']>;
  creator_ends_with?: InputMaybe<Scalars['String']>;
  creator_ends_with_nocase?: InputMaybe<Scalars['String']>;
  creator_gt?: InputMaybe<Scalars['String']>;
  creator_gte?: InputMaybe<Scalars['String']>;
  creator_in?: InputMaybe<Array<Scalars['String']>>;
  creator_lt?: InputMaybe<Scalars['String']>;
  creator_lte?: InputMaybe<Scalars['String']>;
  creator_not?: InputMaybe<Scalars['String']>;
  creator_not_contains?: InputMaybe<Scalars['String']>;
  creator_not_contains_nocase?: InputMaybe<Scalars['String']>;
  creator_not_ends_with?: InputMaybe<Scalars['String']>;
  creator_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  creator_not_in?: InputMaybe<Array<Scalars['String']>>;
  creator_not_starts_with?: InputMaybe<Scalars['String']>;
  creator_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  creator_starts_with?: InputMaybe<Scalars['String']>;
  creator_starts_with_nocase?: InputMaybe<Scalars['String']>;
  deposits_?: InputMaybe<Deposit_Filter>;
  description?: InputMaybe<Scalars['String']>;
  description_contains?: InputMaybe<Scalars['String']>;
  description_contains_nocase?: InputMaybe<Scalars['String']>;
  description_ends_with?: InputMaybe<Scalars['String']>;
  description_ends_with_nocase?: InputMaybe<Scalars['String']>;
  description_gt?: InputMaybe<Scalars['String']>;
  description_gte?: InputMaybe<Scalars['String']>;
  description_in?: InputMaybe<Array<Scalars['String']>>;
  description_lt?: InputMaybe<Scalars['String']>;
  description_lte?: InputMaybe<Scalars['String']>;
  description_not?: InputMaybe<Scalars['String']>;
  description_not_contains?: InputMaybe<Scalars['String']>;
  description_not_contains_nocase?: InputMaybe<Scalars['String']>;
  description_not_ends_with?: InputMaybe<Scalars['String']>;
  description_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  description_not_in?: InputMaybe<Array<Scalars['String']>>;
  description_not_starts_with?: InputMaybe<Scalars['String']>;
  description_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  description_starts_with?: InputMaybe<Scalars['String']>;
  description_starts_with_nocase?: InputMaybe<Scalars['String']>;
  house?: InputMaybe<Scalars['String']>;
  house_?: InputMaybe<House_Filter>;
  house_contains?: InputMaybe<Scalars['String']>;
  house_contains_nocase?: InputMaybe<Scalars['String']>;
  house_ends_with?: InputMaybe<Scalars['String']>;
  house_ends_with_nocase?: InputMaybe<Scalars['String']>;
  house_gt?: InputMaybe<Scalars['String']>;
  house_gte?: InputMaybe<Scalars['String']>;
  house_in?: InputMaybe<Array<Scalars['String']>>;
  house_lt?: InputMaybe<Scalars['String']>;
  house_lte?: InputMaybe<Scalars['String']>;
  house_not?: InputMaybe<Scalars['String']>;
  house_not_contains?: InputMaybe<Scalars['String']>;
  house_not_contains_nocase?: InputMaybe<Scalars['String']>;
  house_not_ends_with?: InputMaybe<Scalars['String']>;
  house_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  house_not_in?: InputMaybe<Array<Scalars['String']>>;
  house_not_starts_with?: InputMaybe<Scalars['String']>;
  house_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  house_starts_with?: InputMaybe<Scalars['String']>;
  house_starts_with_nocase?: InputMaybe<Scalars['String']>;
  id?: InputMaybe<Scalars['ID']>;
  id_gt?: InputMaybe<Scalars['ID']>;
  id_gte?: InputMaybe<Scalars['ID']>;
  id_in?: InputMaybe<Array<Scalars['ID']>>;
  id_lt?: InputMaybe<Scalars['ID']>;
  id_lte?: InputMaybe<Scalars['ID']>;
  id_not?: InputMaybe<Scalars['ID']>;
  id_not_in?: InputMaybe<Array<Scalars['ID']>>;
  manager?: InputMaybe<Scalars['String']>;
  manager_?: InputMaybe<Account_Filter>;
  manager_contains?: InputMaybe<Scalars['String']>;
  manager_contains_nocase?: InputMaybe<Scalars['String']>;
  manager_ends_with?: InputMaybe<Scalars['String']>;
  manager_ends_with_nocase?: InputMaybe<Scalars['String']>;
  manager_gt?: InputMaybe<Scalars['String']>;
  manager_gte?: InputMaybe<Scalars['String']>;
  manager_in?: InputMaybe<Array<Scalars['String']>>;
  manager_lt?: InputMaybe<Scalars['String']>;
  manager_lte?: InputMaybe<Scalars['String']>;
  manager_not?: InputMaybe<Scalars['String']>;
  manager_not_contains?: InputMaybe<Scalars['String']>;
  manager_not_contains_nocase?: InputMaybe<Scalars['String']>;
  manager_not_ends_with?: InputMaybe<Scalars['String']>;
  manager_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  manager_not_in?: InputMaybe<Array<Scalars['String']>>;
  manager_not_starts_with?: InputMaybe<Scalars['String']>;
  manager_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  manager_starts_with?: InputMaybe<Scalars['String']>;
  manager_starts_with_nocase?: InputMaybe<Scalars['String']>;
  or?: InputMaybe<Array<InputMaybe<Round_Filter>>>;
  reclamations_?: InputMaybe<Reclaim_Filter>;
  rescues_?: InputMaybe<Rescue_Filter>;
  state?: InputMaybe<RoundState>;
  state_in?: InputMaybe<Array<RoundState>>;
  state_not?: InputMaybe<RoundState>;
  state_not_in?: InputMaybe<Array<RoundState>>;
  timedFundingConfig?: InputMaybe<Scalars['String']>;
  timedFundingConfig_?: InputMaybe<TimedFundingRoundConfig_Filter>;
  timedFundingConfig_contains?: InputMaybe<Scalars['String']>;
  timedFundingConfig_contains_nocase?: InputMaybe<Scalars['String']>;
  timedFundingConfig_ends_with?: InputMaybe<Scalars['String']>;
  timedFundingConfig_ends_with_nocase?: InputMaybe<Scalars['String']>;
  timedFundingConfig_gt?: InputMaybe<Scalars['String']>;
  timedFundingConfig_gte?: InputMaybe<Scalars['String']>;
  timedFundingConfig_in?: InputMaybe<Array<Scalars['String']>>;
  timedFundingConfig_lt?: InputMaybe<Scalars['String']>;
  timedFundingConfig_lte?: InputMaybe<Scalars['String']>;
  timedFundingConfig_not?: InputMaybe<Scalars['String']>;
  timedFundingConfig_not_contains?: InputMaybe<Scalars['String']>;
  timedFundingConfig_not_contains_nocase?: InputMaybe<Scalars['String']>;
  timedFundingConfig_not_ends_with?: InputMaybe<Scalars['String']>;
  timedFundingConfig_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  timedFundingConfig_not_in?: InputMaybe<Array<Scalars['String']>>;
  timedFundingConfig_not_starts_with?: InputMaybe<Scalars['String']>;
  timedFundingConfig_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  timedFundingConfig_starts_with?: InputMaybe<Scalars['String']>;
  timedFundingConfig_starts_with_nocase?: InputMaybe<Scalars['String']>;
  title?: InputMaybe<Scalars['String']>;
  title_contains?: InputMaybe<Scalars['String']>;
  title_contains_nocase?: InputMaybe<Scalars['String']>;
  title_ends_with?: InputMaybe<Scalars['String']>;
  title_ends_with_nocase?: InputMaybe<Scalars['String']>;
  title_gt?: InputMaybe<Scalars['String']>;
  title_gte?: InputMaybe<Scalars['String']>;
  title_in?: InputMaybe<Array<Scalars['String']>>;
  title_lt?: InputMaybe<Scalars['String']>;
  title_lte?: InputMaybe<Scalars['String']>;
  title_not?: InputMaybe<Scalars['String']>;
  title_not_contains?: InputMaybe<Scalars['String']>;
  title_not_contains_nocase?: InputMaybe<Scalars['String']>;
  title_not_ends_with?: InputMaybe<Scalars['String']>;
  title_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  title_not_in?: InputMaybe<Array<Scalars['String']>>;
  title_not_starts_with?: InputMaybe<Scalars['String']>;
  title_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  title_starts_with?: InputMaybe<Scalars['String']>;
  title_starts_with_nocase?: InputMaybe<Scalars['String']>;
  transfers_?: InputMaybe<Transfer_Filter>;
  type?: InputMaybe<Scalars['String']>;
  type_contains?: InputMaybe<Scalars['String']>;
  type_contains_nocase?: InputMaybe<Scalars['String']>;
  type_ends_with?: InputMaybe<Scalars['String']>;
  type_ends_with_nocase?: InputMaybe<Scalars['String']>;
  type_gt?: InputMaybe<Scalars['String']>;
  type_gte?: InputMaybe<Scalars['String']>;
  type_in?: InputMaybe<Array<Scalars['String']>>;
  type_lt?: InputMaybe<Scalars['String']>;
  type_lte?: InputMaybe<Scalars['String']>;
  type_not?: InputMaybe<Scalars['String']>;
  type_not_contains?: InputMaybe<Scalars['String']>;
  type_not_contains_nocase?: InputMaybe<Scalars['String']>;
  type_not_ends_with?: InputMaybe<Scalars['String']>;
  type_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  type_not_in?: InputMaybe<Array<Scalars['String']>>;
  type_not_starts_with?: InputMaybe<Scalars['String']>;
  type_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  type_starts_with?: InputMaybe<Scalars['String']>;
  type_starts_with_nocase?: InputMaybe<Scalars['String']>;
  votingStrategies_?: InputMaybe<RoundVotingStrategy_Filter>;
};

export enum Round_OrderBy {
  Balances = 'balances',
  Claims = 'claims',
  CreatedAt = 'createdAt',
  CreationTx = 'creationTx',
  Creator = 'creator',
  CreatorId = 'creator__id',
  Deposits = 'deposits',
  Description = 'description',
  House = 'house',
  HouseContractUri = 'house__contractURI',
  HouseCreatedAt = 'house__createdAt',
  HouseCreationTx = 'house__creationTx',
  HouseDescription = 'house__description',
  HouseId = 'house__id',
  HouseImageUri = 'house__imageURI',
  HouseName = 'house__name',
  HouseType = 'house__type',
  Id = 'id',
  Manager = 'manager',
  ManagerId = 'manager__id',
  Reclamations = 'reclamations',
  Rescues = 'rescues',
  State = 'state',
  TimedFundingConfig = 'timedFundingConfig',
  TimedFundingConfigId = 'timedFundingConfig__id',
  TimedFundingConfigProposalPeriodDuration = 'timedFundingConfig__proposalPeriodDuration',
  TimedFundingConfigProposalPeriodStartTimestamp = 'timedFundingConfig__proposalPeriodStartTimestamp',
  TimedFundingConfigRegisteredAt = 'timedFundingConfig__registeredAt',
  TimedFundingConfigRegistrationTx = 'timedFundingConfig__registrationTx',
  TimedFundingConfigVotePeriodDuration = 'timedFundingConfig__votePeriodDuration',
  TimedFundingConfigVotePeriodStartTimestamp = 'timedFundingConfig__votePeriodStartTimestamp',
  TimedFundingConfigWinnerCount = 'timedFundingConfig__winnerCount',
  Title = 'title',
  Transfers = 'transfers',
  Type = 'type',
  VotingStrategies = 'votingStrategies',
}

export type Subscription = {
  __typename?: 'Subscription';
  /** Access to subgraph metadata */
  _meta?: Maybe<_Meta_>;
  account?: Maybe<Account>;
  accounts: Array<Account>;
  administrative?: Maybe<Administrative>;
  administratives: Array<Administrative>;
  asset?: Maybe<Asset>;
  assets: Array<Asset>;
  award?: Maybe<Award>;
  awards: Array<Award>;
  balance?: Maybe<Balance>;
  balances: Array<Balance>;
  claim?: Maybe<Claim>;
  claims: Array<Claim>;
  deposit?: Maybe<Deposit>;
  deposits: Array<Deposit>;
  house?: Maybe<House>;
  houseImplementation?: Maybe<HouseImplementation>;
  houseImplementations: Array<HouseImplementation>;
  houses: Array<House>;
  reclaim?: Maybe<Reclaim>;
  reclaims: Array<Reclaim>;
  rescue?: Maybe<Rescue>;
  rescues: Array<Rescue>;
  round?: Maybe<Round>;
  roundCreator?: Maybe<RoundCreator>;
  roundCreators: Array<RoundCreator>;
  roundImplementation?: Maybe<RoundImplementation>;
  roundImplementations: Array<RoundImplementation>;
  roundVotingStrategies: Array<RoundVotingStrategy>;
  roundVotingStrategy?: Maybe<RoundVotingStrategy>;
  rounds: Array<Round>;
  timedFundingRoundConfig?: Maybe<TimedFundingRoundConfig>;
  timedFundingRoundConfigs: Array<TimedFundingRoundConfig>;
  transfer?: Maybe<Transfer>;
  transfers: Array<Transfer>;
  votingStrategies: Array<VotingStrategy>;
  votingStrategy?: Maybe<VotingStrategy>;
};

export type Subscription_MetaArgs = {
  block?: InputMaybe<Block_Height>;
};

export type SubscriptionAccountArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};

export type SubscriptionAccountsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Account_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<Account_Filter>;
};

export type SubscriptionAdministrativeArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};

export type SubscriptionAdministrativesArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Administrative_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<Administrative_Filter>;
};

export type SubscriptionAssetArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};

export type SubscriptionAssetsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Asset_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<Asset_Filter>;
};

export type SubscriptionAwardArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};

export type SubscriptionAwardsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Award_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<Award_Filter>;
};

export type SubscriptionBalanceArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};

export type SubscriptionBalancesArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Balance_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<Balance_Filter>;
};

export type SubscriptionClaimArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};

export type SubscriptionClaimsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Claim_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<Claim_Filter>;
};

export type SubscriptionDepositArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};

export type SubscriptionDepositsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Deposit_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<Deposit_Filter>;
};

export type SubscriptionHouseArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};

export type SubscriptionHouseImplementationArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};

export type SubscriptionHouseImplementationsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<HouseImplementation_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<HouseImplementation_Filter>;
};

export type SubscriptionHousesArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<House_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<House_Filter>;
};

export type SubscriptionReclaimArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};

export type SubscriptionReclaimsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Reclaim_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<Reclaim_Filter>;
};

export type SubscriptionRescueArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};

export type SubscriptionRescuesArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Rescue_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<Rescue_Filter>;
};

export type SubscriptionRoundArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};

export type SubscriptionRoundCreatorArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};

export type SubscriptionRoundCreatorsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<RoundCreator_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<RoundCreator_Filter>;
};

export type SubscriptionRoundImplementationArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};

export type SubscriptionRoundImplementationsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<RoundImplementation_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<RoundImplementation_Filter>;
};

export type SubscriptionRoundVotingStrategiesArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<RoundVotingStrategy_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<RoundVotingStrategy_Filter>;
};

export type SubscriptionRoundVotingStrategyArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};

export type SubscriptionRoundsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Round_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<Round_Filter>;
};

export type SubscriptionTimedFundingRoundConfigArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};

export type SubscriptionTimedFundingRoundConfigsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<TimedFundingRoundConfig_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<TimedFundingRoundConfig_Filter>;
};

export type SubscriptionTransferArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};

export type SubscriptionTransfersArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Transfer_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<Transfer_Filter>;
};

export type SubscriptionVotingStrategiesArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<VotingStrategy_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<VotingStrategy_Filter>;
};

export type SubscriptionVotingStrategyArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};

export type TimedFundingRoundConfig = {
  __typename?: 'TimedFundingRoundConfig';
  /** The awards offered in the round */
  awards: Array<Award>;
  /** A concatenation of the round address and '-config' */
  id: Scalars['ID'];
  /** The proposal period duration in seconds */
  proposalPeriodDuration?: Maybe<Scalars['BigInt']>;
  /** The timestamp at which the proposal period starts */
  proposalPeriodStartTimestamp?: Maybe<Scalars['BigInt']>;
  /** The unix timestamp when the round configuration was registered */
  registeredAt: Scalars['BigInt'];
  /** The registration transaction hash */
  registrationTx: Scalars['Bytes'];
  /** The round that the config belongs to */
  round: Round;
  /** The vote period duration in seconds */
  votePeriodDuration?: Maybe<Scalars['BigInt']>;
  /** The timestamp at which the vote period starts */
  votePeriodStartTimestamp?: Maybe<Scalars['BigInt']>;
  /** The number of possible round winners */
  winnerCount: Scalars['Int'];
};

export type TimedFundingRoundConfigAwardsArgs = {
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Award_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  where?: InputMaybe<Award_Filter>;
};

export type TimedFundingRoundConfig_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  and?: InputMaybe<Array<InputMaybe<TimedFundingRoundConfig_Filter>>>;
  awards_?: InputMaybe<Award_Filter>;
  id?: InputMaybe<Scalars['ID']>;
  id_gt?: InputMaybe<Scalars['ID']>;
  id_gte?: InputMaybe<Scalars['ID']>;
  id_in?: InputMaybe<Array<Scalars['ID']>>;
  id_lt?: InputMaybe<Scalars['ID']>;
  id_lte?: InputMaybe<Scalars['ID']>;
  id_not?: InputMaybe<Scalars['ID']>;
  id_not_in?: InputMaybe<Array<Scalars['ID']>>;
  or?: InputMaybe<Array<InputMaybe<TimedFundingRoundConfig_Filter>>>;
  proposalPeriodDuration?: InputMaybe<Scalars['BigInt']>;
  proposalPeriodDuration_gt?: InputMaybe<Scalars['BigInt']>;
  proposalPeriodDuration_gte?: InputMaybe<Scalars['BigInt']>;
  proposalPeriodDuration_in?: InputMaybe<Array<Scalars['BigInt']>>;
  proposalPeriodDuration_lt?: InputMaybe<Scalars['BigInt']>;
  proposalPeriodDuration_lte?: InputMaybe<Scalars['BigInt']>;
  proposalPeriodDuration_not?: InputMaybe<Scalars['BigInt']>;
  proposalPeriodDuration_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  proposalPeriodStartTimestamp?: InputMaybe<Scalars['BigInt']>;
  proposalPeriodStartTimestamp_gt?: InputMaybe<Scalars['BigInt']>;
  proposalPeriodStartTimestamp_gte?: InputMaybe<Scalars['BigInt']>;
  proposalPeriodStartTimestamp_in?: InputMaybe<Array<Scalars['BigInt']>>;
  proposalPeriodStartTimestamp_lt?: InputMaybe<Scalars['BigInt']>;
  proposalPeriodStartTimestamp_lte?: InputMaybe<Scalars['BigInt']>;
  proposalPeriodStartTimestamp_not?: InputMaybe<Scalars['BigInt']>;
  proposalPeriodStartTimestamp_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  registeredAt?: InputMaybe<Scalars['BigInt']>;
  registeredAt_gt?: InputMaybe<Scalars['BigInt']>;
  registeredAt_gte?: InputMaybe<Scalars['BigInt']>;
  registeredAt_in?: InputMaybe<Array<Scalars['BigInt']>>;
  registeredAt_lt?: InputMaybe<Scalars['BigInt']>;
  registeredAt_lte?: InputMaybe<Scalars['BigInt']>;
  registeredAt_not?: InputMaybe<Scalars['BigInt']>;
  registeredAt_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  registrationTx?: InputMaybe<Scalars['Bytes']>;
  registrationTx_contains?: InputMaybe<Scalars['Bytes']>;
  registrationTx_gt?: InputMaybe<Scalars['Bytes']>;
  registrationTx_gte?: InputMaybe<Scalars['Bytes']>;
  registrationTx_in?: InputMaybe<Array<Scalars['Bytes']>>;
  registrationTx_lt?: InputMaybe<Scalars['Bytes']>;
  registrationTx_lte?: InputMaybe<Scalars['Bytes']>;
  registrationTx_not?: InputMaybe<Scalars['Bytes']>;
  registrationTx_not_contains?: InputMaybe<Scalars['Bytes']>;
  registrationTx_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  round?: InputMaybe<Scalars['String']>;
  round_?: InputMaybe<Round_Filter>;
  round_contains?: InputMaybe<Scalars['String']>;
  round_contains_nocase?: InputMaybe<Scalars['String']>;
  round_ends_with?: InputMaybe<Scalars['String']>;
  round_ends_with_nocase?: InputMaybe<Scalars['String']>;
  round_gt?: InputMaybe<Scalars['String']>;
  round_gte?: InputMaybe<Scalars['String']>;
  round_in?: InputMaybe<Array<Scalars['String']>>;
  round_lt?: InputMaybe<Scalars['String']>;
  round_lte?: InputMaybe<Scalars['String']>;
  round_not?: InputMaybe<Scalars['String']>;
  round_not_contains?: InputMaybe<Scalars['String']>;
  round_not_contains_nocase?: InputMaybe<Scalars['String']>;
  round_not_ends_with?: InputMaybe<Scalars['String']>;
  round_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  round_not_in?: InputMaybe<Array<Scalars['String']>>;
  round_not_starts_with?: InputMaybe<Scalars['String']>;
  round_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  round_starts_with?: InputMaybe<Scalars['String']>;
  round_starts_with_nocase?: InputMaybe<Scalars['String']>;
  votePeriodDuration?: InputMaybe<Scalars['BigInt']>;
  votePeriodDuration_gt?: InputMaybe<Scalars['BigInt']>;
  votePeriodDuration_gte?: InputMaybe<Scalars['BigInt']>;
  votePeriodDuration_in?: InputMaybe<Array<Scalars['BigInt']>>;
  votePeriodDuration_lt?: InputMaybe<Scalars['BigInt']>;
  votePeriodDuration_lte?: InputMaybe<Scalars['BigInt']>;
  votePeriodDuration_not?: InputMaybe<Scalars['BigInt']>;
  votePeriodDuration_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  votePeriodStartTimestamp?: InputMaybe<Scalars['BigInt']>;
  votePeriodStartTimestamp_gt?: InputMaybe<Scalars['BigInt']>;
  votePeriodStartTimestamp_gte?: InputMaybe<Scalars['BigInt']>;
  votePeriodStartTimestamp_in?: InputMaybe<Array<Scalars['BigInt']>>;
  votePeriodStartTimestamp_lt?: InputMaybe<Scalars['BigInt']>;
  votePeriodStartTimestamp_lte?: InputMaybe<Scalars['BigInt']>;
  votePeriodStartTimestamp_not?: InputMaybe<Scalars['BigInt']>;
  votePeriodStartTimestamp_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  winnerCount?: InputMaybe<Scalars['Int']>;
  winnerCount_gt?: InputMaybe<Scalars['Int']>;
  winnerCount_gte?: InputMaybe<Scalars['Int']>;
  winnerCount_in?: InputMaybe<Array<Scalars['Int']>>;
  winnerCount_lt?: InputMaybe<Scalars['Int']>;
  winnerCount_lte?: InputMaybe<Scalars['Int']>;
  winnerCount_not?: InputMaybe<Scalars['Int']>;
  winnerCount_not_in?: InputMaybe<Array<Scalars['Int']>>;
};

export enum TimedFundingRoundConfig_OrderBy {
  Awards = 'awards',
  Id = 'id',
  ProposalPeriodDuration = 'proposalPeriodDuration',
  ProposalPeriodStartTimestamp = 'proposalPeriodStartTimestamp',
  RegisteredAt = 'registeredAt',
  RegistrationTx = 'registrationTx',
  Round = 'round',
  RoundCreatedAt = 'round__createdAt',
  RoundCreationTx = 'round__creationTx',
  RoundDescription = 'round__description',
  RoundId = 'round__id',
  RoundState = 'round__state',
  RoundTitle = 'round__title',
  RoundType = 'round__type',
  VotePeriodDuration = 'votePeriodDuration',
  VotePeriodStartTimestamp = 'votePeriodStartTimestamp',
  WinnerCount = 'winnerCount',
}

export type Transfer = {
  __typename?: 'Transfer';
  /** The transfer amount */
  amount: Scalars['BigInt'];
  /** The asset that was transferred */
  asset: Asset;
  /** The account who sent the asset receipt token */
  from: Account;
  /** A concatenation of the transfer tx hash and the the event log index */
  id: Scalars['String'];
  /** The round on which the underlying asset exists */
  round: Round;
  /** The account who received the asset receipt token */
  to: Account;
  /** The unix timestamp when this transfer was performed */
  transferredAt: Scalars['BigInt'];
};

export type Transfer_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  amount?: InputMaybe<Scalars['BigInt']>;
  amount_gt?: InputMaybe<Scalars['BigInt']>;
  amount_gte?: InputMaybe<Scalars['BigInt']>;
  amount_in?: InputMaybe<Array<Scalars['BigInt']>>;
  amount_lt?: InputMaybe<Scalars['BigInt']>;
  amount_lte?: InputMaybe<Scalars['BigInt']>;
  amount_not?: InputMaybe<Scalars['BigInt']>;
  amount_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  and?: InputMaybe<Array<InputMaybe<Transfer_Filter>>>;
  asset?: InputMaybe<Scalars['String']>;
  asset_?: InputMaybe<Asset_Filter>;
  asset_contains?: InputMaybe<Scalars['String']>;
  asset_contains_nocase?: InputMaybe<Scalars['String']>;
  asset_ends_with?: InputMaybe<Scalars['String']>;
  asset_ends_with_nocase?: InputMaybe<Scalars['String']>;
  asset_gt?: InputMaybe<Scalars['String']>;
  asset_gte?: InputMaybe<Scalars['String']>;
  asset_in?: InputMaybe<Array<Scalars['String']>>;
  asset_lt?: InputMaybe<Scalars['String']>;
  asset_lte?: InputMaybe<Scalars['String']>;
  asset_not?: InputMaybe<Scalars['String']>;
  asset_not_contains?: InputMaybe<Scalars['String']>;
  asset_not_contains_nocase?: InputMaybe<Scalars['String']>;
  asset_not_ends_with?: InputMaybe<Scalars['String']>;
  asset_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  asset_not_in?: InputMaybe<Array<Scalars['String']>>;
  asset_not_starts_with?: InputMaybe<Scalars['String']>;
  asset_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  asset_starts_with?: InputMaybe<Scalars['String']>;
  asset_starts_with_nocase?: InputMaybe<Scalars['String']>;
  from?: InputMaybe<Scalars['String']>;
  from_?: InputMaybe<Account_Filter>;
  from_contains?: InputMaybe<Scalars['String']>;
  from_contains_nocase?: InputMaybe<Scalars['String']>;
  from_ends_with?: InputMaybe<Scalars['String']>;
  from_ends_with_nocase?: InputMaybe<Scalars['String']>;
  from_gt?: InputMaybe<Scalars['String']>;
  from_gte?: InputMaybe<Scalars['String']>;
  from_in?: InputMaybe<Array<Scalars['String']>>;
  from_lt?: InputMaybe<Scalars['String']>;
  from_lte?: InputMaybe<Scalars['String']>;
  from_not?: InputMaybe<Scalars['String']>;
  from_not_contains?: InputMaybe<Scalars['String']>;
  from_not_contains_nocase?: InputMaybe<Scalars['String']>;
  from_not_ends_with?: InputMaybe<Scalars['String']>;
  from_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  from_not_in?: InputMaybe<Array<Scalars['String']>>;
  from_not_starts_with?: InputMaybe<Scalars['String']>;
  from_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  from_starts_with?: InputMaybe<Scalars['String']>;
  from_starts_with_nocase?: InputMaybe<Scalars['String']>;
  id?: InputMaybe<Scalars['String']>;
  id_contains?: InputMaybe<Scalars['String']>;
  id_contains_nocase?: InputMaybe<Scalars['String']>;
  id_ends_with?: InputMaybe<Scalars['String']>;
  id_ends_with_nocase?: InputMaybe<Scalars['String']>;
  id_gt?: InputMaybe<Scalars['String']>;
  id_gte?: InputMaybe<Scalars['String']>;
  id_in?: InputMaybe<Array<Scalars['String']>>;
  id_lt?: InputMaybe<Scalars['String']>;
  id_lte?: InputMaybe<Scalars['String']>;
  id_not?: InputMaybe<Scalars['String']>;
  id_not_contains?: InputMaybe<Scalars['String']>;
  id_not_contains_nocase?: InputMaybe<Scalars['String']>;
  id_not_ends_with?: InputMaybe<Scalars['String']>;
  id_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  id_not_in?: InputMaybe<Array<Scalars['String']>>;
  id_not_starts_with?: InputMaybe<Scalars['String']>;
  id_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  id_starts_with?: InputMaybe<Scalars['String']>;
  id_starts_with_nocase?: InputMaybe<Scalars['String']>;
  or?: InputMaybe<Array<InputMaybe<Transfer_Filter>>>;
  round?: InputMaybe<Scalars['String']>;
  round_?: InputMaybe<Round_Filter>;
  round_contains?: InputMaybe<Scalars['String']>;
  round_contains_nocase?: InputMaybe<Scalars['String']>;
  round_ends_with?: InputMaybe<Scalars['String']>;
  round_ends_with_nocase?: InputMaybe<Scalars['String']>;
  round_gt?: InputMaybe<Scalars['String']>;
  round_gte?: InputMaybe<Scalars['String']>;
  round_in?: InputMaybe<Array<Scalars['String']>>;
  round_lt?: InputMaybe<Scalars['String']>;
  round_lte?: InputMaybe<Scalars['String']>;
  round_not?: InputMaybe<Scalars['String']>;
  round_not_contains?: InputMaybe<Scalars['String']>;
  round_not_contains_nocase?: InputMaybe<Scalars['String']>;
  round_not_ends_with?: InputMaybe<Scalars['String']>;
  round_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  round_not_in?: InputMaybe<Array<Scalars['String']>>;
  round_not_starts_with?: InputMaybe<Scalars['String']>;
  round_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  round_starts_with?: InputMaybe<Scalars['String']>;
  round_starts_with_nocase?: InputMaybe<Scalars['String']>;
  to?: InputMaybe<Scalars['String']>;
  to_?: InputMaybe<Account_Filter>;
  to_contains?: InputMaybe<Scalars['String']>;
  to_contains_nocase?: InputMaybe<Scalars['String']>;
  to_ends_with?: InputMaybe<Scalars['String']>;
  to_ends_with_nocase?: InputMaybe<Scalars['String']>;
  to_gt?: InputMaybe<Scalars['String']>;
  to_gte?: InputMaybe<Scalars['String']>;
  to_in?: InputMaybe<Array<Scalars['String']>>;
  to_lt?: InputMaybe<Scalars['String']>;
  to_lte?: InputMaybe<Scalars['String']>;
  to_not?: InputMaybe<Scalars['String']>;
  to_not_contains?: InputMaybe<Scalars['String']>;
  to_not_contains_nocase?: InputMaybe<Scalars['String']>;
  to_not_ends_with?: InputMaybe<Scalars['String']>;
  to_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  to_not_in?: InputMaybe<Array<Scalars['String']>>;
  to_not_starts_with?: InputMaybe<Scalars['String']>;
  to_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  to_starts_with?: InputMaybe<Scalars['String']>;
  to_starts_with_nocase?: InputMaybe<Scalars['String']>;
  transferredAt?: InputMaybe<Scalars['BigInt']>;
  transferredAt_gt?: InputMaybe<Scalars['BigInt']>;
  transferredAt_gte?: InputMaybe<Scalars['BigInt']>;
  transferredAt_in?: InputMaybe<Array<Scalars['BigInt']>>;
  transferredAt_lt?: InputMaybe<Scalars['BigInt']>;
  transferredAt_lte?: InputMaybe<Scalars['BigInt']>;
  transferredAt_not?: InputMaybe<Scalars['BigInt']>;
  transferredAt_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
};

export enum Transfer_OrderBy {
  Amount = 'amount',
  Asset = 'asset',
  AssetAssetType = 'asset__assetType',
  AssetId = 'asset__id',
  AssetIdentifier = 'asset__identifier',
  AssetToken = 'asset__token',
  From = 'from',
  FromId = 'from__id',
  Id = 'id',
  Round = 'round',
  RoundCreatedAt = 'round__createdAt',
  RoundCreationTx = 'round__creationTx',
  RoundDescription = 'round__description',
  RoundId = 'round__id',
  RoundState = 'round__state',
  RoundTitle = 'round__title',
  RoundType = 'round__type',
  To = 'to',
  ToId = 'to__id',
  TransferredAt = 'transferredAt',
}

export type VotingStrategy = {
  __typename?: 'VotingStrategy';
  /** The voting strategy Starknet address */
  address: Scalars['BigInt'];
  /** The voting strategy ID (pedersen(address,params)) */
  id: Scalars['ID'];
  /** The voting strategy params */
  params: Array<Scalars['BigInt']>;
  /** Rounds that use this voting strategy */
  rounds: Array<RoundVotingStrategy>;
  /** The voting strategy type (UNKNOWN if it cannot be determined) */
  type: VotingStrategyType;
};

export type VotingStrategyRoundsArgs = {
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<RoundVotingStrategy_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  where?: InputMaybe<RoundVotingStrategy_Filter>;
};

export enum VotingStrategyType {
  BalanceOf = 'BALANCE_OF',
  BalanceOfWithMultiplier = 'BALANCE_OF_WITH_MULTIPLIER',
  Unknown = 'UNKNOWN',
  Vanilla = 'VANILLA',
  Whitelist = 'WHITELIST',
}

export type VotingStrategy_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  address?: InputMaybe<Scalars['BigInt']>;
  address_gt?: InputMaybe<Scalars['BigInt']>;
  address_gte?: InputMaybe<Scalars['BigInt']>;
  address_in?: InputMaybe<Array<Scalars['BigInt']>>;
  address_lt?: InputMaybe<Scalars['BigInt']>;
  address_lte?: InputMaybe<Scalars['BigInt']>;
  address_not?: InputMaybe<Scalars['BigInt']>;
  address_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  and?: InputMaybe<Array<InputMaybe<VotingStrategy_Filter>>>;
  id?: InputMaybe<Scalars['ID']>;
  id_gt?: InputMaybe<Scalars['ID']>;
  id_gte?: InputMaybe<Scalars['ID']>;
  id_in?: InputMaybe<Array<Scalars['ID']>>;
  id_lt?: InputMaybe<Scalars['ID']>;
  id_lte?: InputMaybe<Scalars['ID']>;
  id_not?: InputMaybe<Scalars['ID']>;
  id_not_in?: InputMaybe<Array<Scalars['ID']>>;
  or?: InputMaybe<Array<InputMaybe<VotingStrategy_Filter>>>;
  params?: InputMaybe<Array<Scalars['BigInt']>>;
  params_contains?: InputMaybe<Array<Scalars['BigInt']>>;
  params_contains_nocase?: InputMaybe<Array<Scalars['BigInt']>>;
  params_not?: InputMaybe<Array<Scalars['BigInt']>>;
  params_not_contains?: InputMaybe<Array<Scalars['BigInt']>>;
  params_not_contains_nocase?: InputMaybe<Array<Scalars['BigInt']>>;
  rounds_?: InputMaybe<RoundVotingStrategy_Filter>;
  type?: InputMaybe<VotingStrategyType>;
  type_in?: InputMaybe<Array<VotingStrategyType>>;
  type_not?: InputMaybe<VotingStrategyType>;
  type_not_in?: InputMaybe<Array<VotingStrategyType>>;
};

export enum VotingStrategy_OrderBy {
  Address = 'address',
  Id = 'id',
  Params = 'params',
  Rounds = 'rounds',
  Type = 'type',
}

export type _Block_ = {
  __typename?: '_Block_';
  /** The hash of the block */
  hash?: Maybe<Scalars['Bytes']>;
  /** The block number */
  number: Scalars['Int'];
  /** Integer representation of the timestamp stored in blocks for the chain */
  timestamp?: Maybe<Scalars['Int']>;
};

/** The type for the top-level _meta field */
export type _Meta_ = {
  __typename?: '_Meta_';
  /**
   * Information about a specific subgraph block. The hash of the block
   * will be null if the _meta field has a block constraint that asks for
   * a block number. It will be filled if the _meta field has no block constraint
   * and therefore asks for the latest  block
   *
   */
  block: _Block_;
  /** The deployment ID */
  deployment: Scalars['String'];
  /** If `true`, the subgraph encountered indexing errors at some past block */
  hasIndexingErrors: Scalars['Boolean'];
};

export enum _SubgraphErrorPolicy_ {
  /** Data will be returned even if the subgraph has indexing errors */
  Allow = 'allow',
  /** If the subgraph has indexing errors, data will be omitted. The default. */
  Deny = 'deny',
}

export type TimedFundingRoundConfigPartsFragment = {
  __typename?: 'TimedFundingRoundConfig';
  winnerCount: number;
  proposalPeriodStartTimestamp?: any | null;
  proposalPeriodDuration?: any | null;
  votePeriodStartTimestamp?: any | null;
  votePeriodDuration?: any | null;
  awards: Array<{
    __typename?: 'Award';
    amount: any;
    asset: { __typename?: 'Asset'; assetType: AssetType; token: any; identifier: any };
  }>;
} & { ' $fragmentName'?: 'TimedFundingRoundConfigPartsFragment' };

export type ManyHousesSimpleQueryVariables = Exact<{
  first: Scalars['Int'];
  skip: Scalars['Int'];
  orderBy?: InputMaybe<House_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
}>;

export type ManyHousesSimpleQuery = {
  __typename?: 'Query';
  houses: Array<{
    __typename?: 'House';
    id: string;
    name?: string | null;
    description?: string | null;
    imageURI?: string | null;
    createdAt: any;
  }>;
};

export type ManyHousesSimpleWhereAccountHasCreatorPermissionsQueryVariables = Exact<{
  creator: Scalars['String'];
  first: Scalars['Int'];
  skip: Scalars['Int'];
  orderBy?: InputMaybe<Round_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
}>;

export type ManyHousesSimpleWhereAccountHasCreatorPermissionsQuery = {
  __typename?: 'Query';
  houses: Array<{
    __typename?: 'House';
    id: string;
    name?: string | null;
    description?: string | null;
    imageURI?: string | null;
    createdAt: any;
  }>;
};

export type ManyHousesSimpleWhereAccountIsOwnerQueryVariables = Exact<{
  owner: Scalars['String'];
  first: Scalars['Int'];
  skip: Scalars['Int'];
  orderBy?: InputMaybe<Round_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
}>;

export type ManyHousesSimpleWhereAccountIsOwnerQuery = {
  __typename?: 'Query';
  houses: Array<{
    __typename?: 'House';
    id: string;
    name?: string | null;
    description?: string | null;
    imageURI?: string | null;
    createdAt: any;
  }>;
};

export type ManyRoundsSimpleQueryVariables = Exact<{
  first: Scalars['Int'];
  skip: Scalars['Int'];
  orderBy?: InputMaybe<Round_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
}>;

export type ManyRoundsSimpleQuery = {
  __typename?: 'Query';
  rounds: Array<{
    __typename?: 'Round';
    id: string;
    type: string;
    title: string;
    description: string;
    createdAt: any;
    state: RoundState;
  }>;
};

export type ManyRoundsSimpleForHouseQueryVariables = Exact<{
  house: Scalars['String'];
  first: Scalars['Int'];
  skip: Scalars['Int'];
  orderBy?: InputMaybe<Round_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
}>;

export type ManyRoundsSimpleForHouseQuery = {
  __typename?: 'Query';
  rounds: Array<{
    __typename?: 'Round';
    id: string;
    type: string;
    title: string;
    description: string;
    createdAt: any;
    state: RoundState;
  }>;
};

export type ManyRoundsSimpleWhereTitleContainsQueryVariables = Exact<{
  titleContains: Scalars['String'];
  first: Scalars['Int'];
  skip: Scalars['Int'];
  orderBy?: InputMaybe<Round_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
}>;

export type ManyRoundsSimpleWhereTitleContainsQuery = {
  __typename?: 'Query';
  rounds: Array<{
    __typename?: 'Round';
    id: string;
    type: string;
    title: string;
    description: string;
    createdAt: any;
    state: RoundState;
  }>;
};

export type RoundQueryVariables = Exact<{
  id: Scalars['ID'];
}>;

export type RoundQuery = {
  __typename?: 'Query';
  round?: {
    __typename?: 'Round';
    id: string;
    type: string;
    title: string;
    description: string;
    createdAt: any;
    state: RoundState;
    manager?: { __typename?: 'Account'; id: string } | null;
    votingStrategies: Array<{
      __typename?: 'RoundVotingStrategy';
      votingStrategy: {
        __typename?: 'VotingStrategy';
        id: string;
        type: VotingStrategyType;
        address: any;
        params: Array<any>;
      };
    }>;
    timedFundingConfig?:
      | ({ __typename?: 'TimedFundingRoundConfig' } & {
          ' $fragmentRefs'?: {
            TimedFundingRoundConfigPartsFragment: TimedFundingRoundConfigPartsFragment;
          };
        })
      | null;
  } | null;
};

export type ManyRoundBalancesQueryVariables = Exact<{
  round: Scalars['String'];
  first: Scalars['Int'];
  skip: Scalars['Int'];
  orderBy?: InputMaybe<Balance_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
}>;

export type ManyRoundBalancesQuery = {
  __typename?: 'Query';
  balances: Array<{
    __typename?: 'Balance';
    id: string;
    balance: any;
    updatedAt: any;
    asset: { __typename?: 'Asset'; assetType: AssetType; token: any; identifier: any };
  }>;
};

export type ManyRoundVotingStrategiesQueryVariables = Exact<{
  round: Scalars['String'];
  first: Scalars['Int'];
  skip: Scalars['Int'];
  orderBy?: InputMaybe<VotingStrategy_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
}>;

export type ManyRoundVotingStrategiesQuery = {
  __typename?: 'Query';
  votingStrategies: Array<{
    __typename?: 'VotingStrategy';
    id: string;
    type: VotingStrategyType;
    address: any;
    params: Array<any>;
  }>;
};

export type ManyRoundsSimpleManagedByAccountQueryVariables = Exact<{
  manager: Scalars['String'];
  first: Scalars['Int'];
  skip: Scalars['Int'];
  orderBy?: InputMaybe<Round_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
}>;

export type ManyRoundsSimpleManagedByAccountQuery = {
  __typename?: 'Query';
  rounds: Array<{
    __typename?: 'Round';
    id: string;
    type: string;
    title: string;
    description: string;
    createdAt: any;
    state: RoundState;
  }>;
};

export type ManyDepositsByAccountQueryVariables = Exact<{
  depositor: Scalars['String'];
  first: Scalars['Int'];
  skip: Scalars['Int'];
  orderBy?: InputMaybe<Deposit_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
}>;

export type ManyDepositsByAccountQuery = {
  __typename?: 'Query';
  deposits: Array<{
    __typename?: 'Deposit';
    id: string;
    depositedAt: any;
    amount: any;
    asset: { __typename?: 'Asset'; assetType: AssetType; token: any; identifier: any };
    round: { __typename?: 'Round'; id: string };
  }>;
};

export type ManyClaimsByAccountQueryVariables = Exact<{
  claimer: Scalars['String'];
  first: Scalars['Int'];
  skip: Scalars['Int'];
  orderBy?: InputMaybe<Claim_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
}>;

export type ManyClaimsByAccountQuery = {
  __typename?: 'Query';
  claims: Array<{
    __typename?: 'Claim';
    id: string;
    claimedAt: any;
    recipient: any;
    proposalId: any;
    amount: any;
    round: { __typename?: 'Round'; id: string };
    asset: { __typename?: 'Asset'; assetType: AssetType; token: any; identifier: any };
  }>;
};

export const TimedFundingRoundConfigPartsFragmentDoc = {
  kind: 'Document',
  definitions: [
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'TimedFundingRoundConfigParts' },
      typeCondition: {
        kind: 'NamedType',
        name: { kind: 'Name', value: 'TimedFundingRoundConfig' },
      },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'winnerCount' } },
          { kind: 'Field', name: { kind: 'Name', value: 'proposalPeriodStartTimestamp' } },
          { kind: 'Field', name: { kind: 'Name', value: 'proposalPeriodDuration' } },
          { kind: 'Field', name: { kind: 'Name', value: 'votePeriodStartTimestamp' } },
          { kind: 'Field', name: { kind: 'Name', value: 'votePeriodDuration' } },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'awards' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'asset' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'assetType' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'token' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'identifier' } },
                    ],
                  },
                },
                { kind: 'Field', name: { kind: 'Name', value: 'amount' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<TimedFundingRoundConfigPartsFragment, unknown>;
export const ManyHousesSimpleDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'manyHousesSimple' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'first' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'Int' } },
          },
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'skip' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'Int' } },
          },
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'orderBy' } },
          type: { kind: 'NamedType', name: { kind: 'Name', value: 'House_orderBy' } },
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'orderDirection' } },
          type: { kind: 'NamedType', name: { kind: 'Name', value: 'OrderDirection' } },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'houses' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'first' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'first' } },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'skip' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'skip' } },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'orderBy' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'orderBy' } },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'orderDirection' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'orderDirection' } },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                { kind: 'Field', name: { kind: 'Name', value: 'description' } },
                { kind: 'Field', name: { kind: 'Name', value: 'imageURI' } },
                { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<ManyHousesSimpleQuery, ManyHousesSimpleQueryVariables>;
export const ManyHousesSimpleWhereAccountHasCreatorPermissionsDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'manyHousesSimpleWhereAccountHasCreatorPermissions' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'creator' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } },
          },
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'first' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'Int' } },
          },
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'skip' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'Int' } },
          },
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'orderBy' } },
          type: { kind: 'NamedType', name: { kind: 'Name', value: 'Round_orderBy' } },
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'orderDirection' } },
          type: { kind: 'NamedType', name: { kind: 'Name', value: 'OrderDirection' } },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'houses' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'where' },
                value: {
                  kind: 'ObjectValue',
                  fields: [
                    {
                      kind: 'ObjectField',
                      name: { kind: 'Name', value: 'roundCreators_' },
                      value: {
                        kind: 'ObjectValue',
                        fields: [
                          {
                            kind: 'ObjectField',
                            name: { kind: 'Name', value: 'creator' },
                            value: { kind: 'Variable', name: { kind: 'Name', value: 'creator' } },
                          },
                        ],
                      },
                    },
                  ],
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                { kind: 'Field', name: { kind: 'Name', value: 'description' } },
                { kind: 'Field', name: { kind: 'Name', value: 'imageURI' } },
                { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  ManyHousesSimpleWhereAccountHasCreatorPermissionsQuery,
  ManyHousesSimpleWhereAccountHasCreatorPermissionsQueryVariables
>;
export const ManyHousesSimpleWhereAccountIsOwnerDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'manyHousesSimpleWhereAccountIsOwner' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'owner' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } },
          },
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'first' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'Int' } },
          },
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'skip' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'Int' } },
          },
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'orderBy' } },
          type: { kind: 'NamedType', name: { kind: 'Name', value: 'Round_orderBy' } },
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'orderDirection' } },
          type: { kind: 'NamedType', name: { kind: 'Name', value: 'OrderDirection' } },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'houses' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'where' },
                value: {
                  kind: 'ObjectValue',
                  fields: [
                    {
                      kind: 'ObjectField',
                      name: { kind: 'Name', value: 'owner' },
                      value: { kind: 'Variable', name: { kind: 'Name', value: 'owner' } },
                    },
                  ],
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                { kind: 'Field', name: { kind: 'Name', value: 'description' } },
                { kind: 'Field', name: { kind: 'Name', value: 'imageURI' } },
                { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  ManyHousesSimpleWhereAccountIsOwnerQuery,
  ManyHousesSimpleWhereAccountIsOwnerQueryVariables
>;
export const ManyRoundsSimpleDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'manyRoundsSimple' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'first' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'Int' } },
          },
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'skip' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'Int' } },
          },
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'orderBy' } },
          type: { kind: 'NamedType', name: { kind: 'Name', value: 'Round_orderBy' } },
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'orderDirection' } },
          type: { kind: 'NamedType', name: { kind: 'Name', value: 'OrderDirection' } },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'rounds' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'first' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'first' } },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'skip' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'skip' } },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'orderBy' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'orderBy' } },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'orderDirection' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'orderDirection' } },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'type' } },
                { kind: 'Field', name: { kind: 'Name', value: 'title' } },
                { kind: 'Field', name: { kind: 'Name', value: 'description' } },
                { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
                { kind: 'Field', name: { kind: 'Name', value: 'state' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<ManyRoundsSimpleQuery, ManyRoundsSimpleQueryVariables>;
export const ManyRoundsSimpleForHouseDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'manyRoundsSimpleForHouse' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'house' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } },
          },
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'first' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'Int' } },
          },
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'skip' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'Int' } },
          },
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'orderBy' } },
          type: { kind: 'NamedType', name: { kind: 'Name', value: 'Round_orderBy' } },
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'orderDirection' } },
          type: { kind: 'NamedType', name: { kind: 'Name', value: 'OrderDirection' } },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'rounds' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'first' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'first' } },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'skip' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'skip' } },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'orderBy' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'orderBy' } },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'orderDirection' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'orderDirection' } },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'where' },
                value: {
                  kind: 'ObjectValue',
                  fields: [
                    {
                      kind: 'ObjectField',
                      name: { kind: 'Name', value: 'house' },
                      value: { kind: 'Variable', name: { kind: 'Name', value: 'house' } },
                    },
                  ],
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'type' } },
                { kind: 'Field', name: { kind: 'Name', value: 'title' } },
                { kind: 'Field', name: { kind: 'Name', value: 'description' } },
                { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
                { kind: 'Field', name: { kind: 'Name', value: 'state' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<ManyRoundsSimpleForHouseQuery, ManyRoundsSimpleForHouseQueryVariables>;
export const ManyRoundsSimpleWhereTitleContainsDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'manyRoundsSimpleWhereTitleContains' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'titleContains' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } },
          },
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'first' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'Int' } },
          },
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'skip' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'Int' } },
          },
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'orderBy' } },
          type: { kind: 'NamedType', name: { kind: 'Name', value: 'Round_orderBy' } },
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'orderDirection' } },
          type: { kind: 'NamedType', name: { kind: 'Name', value: 'OrderDirection' } },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'rounds' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'first' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'first' } },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'skip' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'skip' } },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'orderBy' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'orderBy' } },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'orderDirection' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'orderDirection' } },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'where' },
                value: {
                  kind: 'ObjectValue',
                  fields: [
                    {
                      kind: 'ObjectField',
                      name: { kind: 'Name', value: 'title_contains_nocase' },
                      value: { kind: 'Variable', name: { kind: 'Name', value: 'titleContains' } },
                    },
                  ],
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'type' } },
                { kind: 'Field', name: { kind: 'Name', value: 'title' } },
                { kind: 'Field', name: { kind: 'Name', value: 'description' } },
                { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
                { kind: 'Field', name: { kind: 'Name', value: 'state' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  ManyRoundsSimpleWhereTitleContainsQuery,
  ManyRoundsSimpleWhereTitleContainsQueryVariables
>;
export const RoundDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'round' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'id' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'ID' } },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'round' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'id' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'id' } },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'type' } },
                { kind: 'Field', name: { kind: 'Name', value: 'title' } },
                { kind: 'Field', name: { kind: 'Name', value: 'description' } },
                { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
                { kind: 'Field', name: { kind: 'Name', value: 'state' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'manager' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [{ kind: 'Field', name: { kind: 'Name', value: 'id' } }],
                  },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'votingStrategies' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'votingStrategy' },
                        selectionSet: {
                          kind: 'SelectionSet',
                          selections: [
                            { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                            { kind: 'Field', name: { kind: 'Name', value: 'type' } },
                            { kind: 'Field', name: { kind: 'Name', value: 'address' } },
                            { kind: 'Field', name: { kind: 'Name', value: 'params' } },
                          ],
                        },
                      },
                    ],
                  },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'timedFundingConfig' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      {
                        kind: 'FragmentSpread',
                        name: { kind: 'Name', value: 'TimedFundingRoundConfigParts' },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'TimedFundingRoundConfigParts' },
      typeCondition: {
        kind: 'NamedType',
        name: { kind: 'Name', value: 'TimedFundingRoundConfig' },
      },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'winnerCount' } },
          { kind: 'Field', name: { kind: 'Name', value: 'proposalPeriodStartTimestamp' } },
          { kind: 'Field', name: { kind: 'Name', value: 'proposalPeriodDuration' } },
          { kind: 'Field', name: { kind: 'Name', value: 'votePeriodStartTimestamp' } },
          { kind: 'Field', name: { kind: 'Name', value: 'votePeriodDuration' } },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'awards' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'asset' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'assetType' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'token' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'identifier' } },
                    ],
                  },
                },
                { kind: 'Field', name: { kind: 'Name', value: 'amount' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<RoundQuery, RoundQueryVariables>;
export const ManyRoundBalancesDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'manyRoundBalances' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'round' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } },
          },
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'first' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'Int' } },
          },
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'skip' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'Int' } },
          },
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'orderBy' } },
          type: { kind: 'NamedType', name: { kind: 'Name', value: 'Balance_orderBy' } },
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'orderDirection' } },
          type: { kind: 'NamedType', name: { kind: 'Name', value: 'OrderDirection' } },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'balances' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'first' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'first' } },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'skip' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'skip' } },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'orderBy' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'orderBy' } },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'orderDirection' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'orderDirection' } },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'where' },
                value: {
                  kind: 'ObjectValue',
                  fields: [
                    {
                      kind: 'ObjectField',
                      name: { kind: 'Name', value: 'round' },
                      value: { kind: 'Variable', name: { kind: 'Name', value: 'round' } },
                    },
                  ],
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'asset' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'assetType' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'token' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'identifier' } },
                    ],
                  },
                },
                { kind: 'Field', name: { kind: 'Name', value: 'balance' } },
                { kind: 'Field', name: { kind: 'Name', value: 'updatedAt' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<ManyRoundBalancesQuery, ManyRoundBalancesQueryVariables>;
export const ManyRoundVotingStrategiesDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'manyRoundVotingStrategies' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'round' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } },
          },
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'first' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'Int' } },
          },
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'skip' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'Int' } },
          },
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'orderBy' } },
          type: { kind: 'NamedType', name: { kind: 'Name', value: 'VotingStrategy_orderBy' } },
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'orderDirection' } },
          type: { kind: 'NamedType', name: { kind: 'Name', value: 'OrderDirection' } },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'votingStrategies' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'first' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'first' } },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'skip' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'skip' } },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'orderBy' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'orderBy' } },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'orderDirection' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'orderDirection' } },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'where' },
                value: {
                  kind: 'ObjectValue',
                  fields: [
                    {
                      kind: 'ObjectField',
                      name: { kind: 'Name', value: 'rounds_' },
                      value: {
                        kind: 'ObjectValue',
                        fields: [
                          {
                            kind: 'ObjectField',
                            name: { kind: 'Name', value: 'round' },
                            value: { kind: 'Variable', name: { kind: 'Name', value: 'round' } },
                          },
                        ],
                      },
                    },
                  ],
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'type' } },
                { kind: 'Field', name: { kind: 'Name', value: 'address' } },
                { kind: 'Field', name: { kind: 'Name', value: 'params' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  ManyRoundVotingStrategiesQuery,
  ManyRoundVotingStrategiesQueryVariables
>;
export const ManyRoundsSimpleManagedByAccountDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'manyRoundsSimpleManagedByAccount' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'manager' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } },
          },
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'first' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'Int' } },
          },
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'skip' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'Int' } },
          },
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'orderBy' } },
          type: { kind: 'NamedType', name: { kind: 'Name', value: 'Round_orderBy' } },
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'orderDirection' } },
          type: { kind: 'NamedType', name: { kind: 'Name', value: 'OrderDirection' } },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'rounds' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'first' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'first' } },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'skip' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'skip' } },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'orderBy' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'orderBy' } },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'orderDirection' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'orderDirection' } },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'where' },
                value: {
                  kind: 'ObjectValue',
                  fields: [
                    {
                      kind: 'ObjectField',
                      name: { kind: 'Name', value: 'manager' },
                      value: { kind: 'Variable', name: { kind: 'Name', value: 'manager' } },
                    },
                  ],
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'type' } },
                { kind: 'Field', name: { kind: 'Name', value: 'title' } },
                { kind: 'Field', name: { kind: 'Name', value: 'description' } },
                { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
                { kind: 'Field', name: { kind: 'Name', value: 'state' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  ManyRoundsSimpleManagedByAccountQuery,
  ManyRoundsSimpleManagedByAccountQueryVariables
>;
export const ManyDepositsByAccountDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'manyDepositsByAccount' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'depositor' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } },
          },
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'first' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'Int' } },
          },
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'skip' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'Int' } },
          },
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'orderBy' } },
          type: { kind: 'NamedType', name: { kind: 'Name', value: 'Deposit_orderBy' } },
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'orderDirection' } },
          type: { kind: 'NamedType', name: { kind: 'Name', value: 'OrderDirection' } },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'deposits' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'first' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'first' } },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'skip' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'skip' } },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'orderBy' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'orderBy' } },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'orderDirection' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'orderDirection' } },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'where' },
                value: {
                  kind: 'ObjectValue',
                  fields: [
                    {
                      kind: 'ObjectField',
                      name: { kind: 'Name', value: 'depositor' },
                      value: { kind: 'Variable', name: { kind: 'Name', value: 'depositor' } },
                    },
                  ],
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'depositedAt' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'asset' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'assetType' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'token' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'identifier' } },
                    ],
                  },
                },
                { kind: 'Field', name: { kind: 'Name', value: 'amount' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'round' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [{ kind: 'Field', name: { kind: 'Name', value: 'id' } }],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<ManyDepositsByAccountQuery, ManyDepositsByAccountQueryVariables>;
export const ManyClaimsByAccountDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'manyClaimsByAccount' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'claimer' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } },
          },
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'first' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'Int' } },
          },
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'skip' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'Int' } },
          },
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'orderBy' } },
          type: { kind: 'NamedType', name: { kind: 'Name', value: 'Claim_orderBy' } },
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'orderDirection' } },
          type: { kind: 'NamedType', name: { kind: 'Name', value: 'OrderDirection' } },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'claims' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'first' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'first' } },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'skip' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'skip' } },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'orderBy' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'orderBy' } },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'orderDirection' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'orderDirection' } },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'where' },
                value: {
                  kind: 'ObjectValue',
                  fields: [
                    {
                      kind: 'ObjectField',
                      name: { kind: 'Name', value: 'claimer' },
                      value: { kind: 'Variable', name: { kind: 'Name', value: 'claimer' } },
                    },
                  ],
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'claimedAt' } },
                { kind: 'Field', name: { kind: 'Name', value: 'recipient' } },
                { kind: 'Field', name: { kind: 'Name', value: 'proposalId' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'round' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [{ kind: 'Field', name: { kind: 'Name', value: 'id' } }],
                  },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'asset' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'assetType' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'token' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'identifier' } },
                    ],
                  },
                },
                { kind: 'Field', name: { kind: 'Name', value: 'amount' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<ManyClaimsByAccountQuery, ManyClaimsByAccountQueryVariables>;
