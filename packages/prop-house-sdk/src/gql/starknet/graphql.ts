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
};

export type Account = {
  __typename?: 'Account';
  /** The unix timestamp at which the account first interacted with prop house */
  firstSeenAt: Scalars['Int'];
  /** The account address */
  id: Scalars['String'];
  /** The number of proposals created by the account */
  proposalCount: Scalars['Int'];
  /** All proposals submitted by the account */
  proposals: Array<Maybe<Proposal>>;
  /** The number of votes submitted by the account */
  voteCount: Scalars['Int'];
  /** All votes submitted by the account */
  votes: Array<Maybe<Vote>>;
};

export enum OrderByAccountFields {
  FirstSeenAt = 'firstSeenAt',
  Id = 'id',
  ProposalCount = 'proposalCount',
  VoteCount = 'voteCount',
}

export enum OrderByProposalFields {
  Body = 'body',
  Id = 'id',
  IsCancelled = 'isCancelled',
  IsWinner = 'isWinner',
  MetadataUri = 'metadataUri',
  ProposalId = 'proposalId',
  Proposer = 'proposer',
  ReceivedAt = 'receivedAt',
  Round = 'round',
  Title = 'title',
  Tx = 'tx',
  VoteCount = 'voteCount',
}

export enum OrderByRoundFields {
  Id = 'id',
  ProposalCount = 'proposalCount',
  RegisteredAt = 'registeredAt',
  SourceChainRound = 'sourceChainRound',
  State = 'state',
  Tx = 'tx',
  Type = 'type',
  VoteCount = 'voteCount',
}

export enum OrderBySummaryFields {
  Id = 'id',
  ProposalCount = 'proposalCount',
  RoundCount = 'roundCount',
  VoteSubmissionCount = 'voteSubmissionCount',
}

export enum OrderByVoteFields {
  Id = 'id',
  Proposal = 'proposal',
  ReceivedAt = 'receivedAt',
  Round = 'round',
  Tx = 'tx',
  Voter = 'voter',
  VotingPower = 'votingPower',
}

export enum OrderBy_CheckpointFields {
  BlockNumber = 'block_number',
  ContractAddress = 'contract_address',
  Id = 'id',
}

export enum OrderBy_MetadataFields {
  Id = 'id',
  Value = 'value',
}

export enum OrderDirection {
  Asc = 'asc',
  Desc = 'desc',
}

export type Proposal = {
  __typename?: 'Proposal';
  /** The proposal body */
  body: Scalars['String'];
  /** A concatenation of the Starknet round address and proposal ID */
  id: Scalars['String'];
  /** Whether the proposal has been cancelled */
  isCancelled: Scalars['Boolean'];
  /** Whether the proposal has been selected as a winner */
  isWinner: Scalars['Boolean'];
  /** The proposal metadata URI */
  metadataUri: Scalars['String'];
  /** The proposal ID */
  proposalId: Scalars['Int'];
  /** The proposer account */
  proposer: Account;
  /** The unix timestamp when the proposal was received */
  receivedAt: Scalars['Int'];
  /** The round that the proposal was submitted to */
  round: Round;
  /** The proposal title */
  title: Scalars['String'];
  /** The transaction in which the proposal was submitted */
  tx?: Maybe<Scalars['String']>;
  /** The number of votes that the proposal has received */
  voteCount: Scalars['Int'];
  /** All votes that the proposal has received */
  votes: Array<Maybe<Vote>>;
};

export type Query = {
  __typename?: 'Query';
  _checkpoint?: Maybe<_Checkpoint>;
  _checkpoints?: Maybe<Array<Maybe<_Checkpoint>>>;
  _metadata?: Maybe<Array<Maybe<_Metadata>>>;
  account?: Maybe<Account>;
  accounts?: Maybe<Array<Maybe<Account>>>;
  proposal?: Maybe<Proposal>;
  proposals?: Maybe<Array<Maybe<Proposal>>>;
  round?: Maybe<Round>;
  rounds?: Maybe<Array<Maybe<Round>>>;
  summaries?: Maybe<Array<Maybe<Summary>>>;
  summary?: Maybe<Summary>;
  vote?: Maybe<Vote>;
  votes?: Maybe<Array<Maybe<Vote>>>;
};

export type Query_CheckpointArgs = {
  id: Scalars['ID'];
};

export type Query_CheckpointsArgs = {
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<OrderBy_CheckpointFields>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  where?: InputMaybe<Where_Checkpoint>;
};

export type Query_MetadataArgs = {
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<OrderBy_MetadataFields>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  where?: InputMaybe<Where_Metadata>;
};

export type QueryAccountArgs = {
  id: Scalars['String'];
};

export type QueryAccountsArgs = {
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<OrderByAccountFields>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  where?: InputMaybe<WhereAccount>;
};

export type QueryProposalArgs = {
  id: Scalars['String'];
};

export type QueryProposalsArgs = {
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<OrderByProposalFields>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  where?: InputMaybe<WhereProposal>;
};

export type QueryRoundArgs = {
  id: Scalars['String'];
};

export type QueryRoundsArgs = {
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<OrderByRoundFields>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  where?: InputMaybe<WhereRound>;
};

export type QuerySummariesArgs = {
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<OrderBySummaryFields>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  where?: InputMaybe<WhereSummary>;
};

export type QuerySummaryArgs = {
  id: Scalars['String'];
};

export type QueryVoteArgs = {
  id: Scalars['String'];
};

export type QueryVotesArgs = {
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<OrderByVoteFields>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  where?: InputMaybe<WhereVote>;
};

export type Round = {
  __typename?: 'Round';
  /** The Starknet round address */
  id: Scalars['String'];
  /** The total number of proposals in the round */
  proposalCount: Scalars['Int'];
  /** All proposals that have been submitted to the round */
  proposals: Array<Maybe<Proposal>>;
  /** The unix timestamp when the round was registered */
  registeredAt: Scalars['Int'];
  /** The round address on the source chain */
  sourceChainRound: Scalars['String'];
  /** The round state */
  state: Scalars['String'];
  /** The transaction in which the round was registered */
  tx?: Maybe<Scalars['String']>;
  /** The round type (TIMED_FUNDING) */
  type: Scalars['String'];
  /** The total number of votes in the round */
  voteCount: Scalars['Int'];
  /** All votes that have been cast in the round */
  votes: Array<Maybe<Vote>>;
};

export type Summary = {
  __typename?: 'Summary';
  /** A constant (SUMMARY) */
  id: Scalars['String'];
  /** The total number of proposals across all rounds */
  proposalCount: Scalars['Int'];
  /** The total number of rounds across all houses */
  roundCount: Scalars['Int'];
  /** The total number of vote submissions across all rounds */
  voteSubmissionCount: Scalars['Int'];
};

export type Vote = {
  __typename?: 'Vote';
  /** A concatenation of the vote transaction hash and log index */
  id: Scalars['String'];
  /** The proposal that was voted for */
  proposal: Proposal;
  /** The unix timestamp when the vote was received */
  receivedAt: Scalars['Int'];
  /** The round that the vote is in */
  round: Round;
  /** The transaction in which the votes were submitted */
  tx?: Maybe<Scalars['String']>;
  /** The voter account */
  voter: Account;
  /** The amount of voting power */
  votingPower: Scalars['Int'];
};

export type WhereAccount = {
  firstSeenAt?: InputMaybe<Scalars['Int']>;
  firstSeenAt_gt?: InputMaybe<Scalars['Int']>;
  firstSeenAt_gte?: InputMaybe<Scalars['Int']>;
  firstSeenAt_in?: InputMaybe<Array<InputMaybe<Scalars['Int']>>>;
  firstSeenAt_lt?: InputMaybe<Scalars['Int']>;
  firstSeenAt_lte?: InputMaybe<Scalars['Int']>;
  firstSeenAt_not?: InputMaybe<Scalars['Int']>;
  firstSeenAt_not_in?: InputMaybe<Array<InputMaybe<Scalars['Int']>>>;
  id?: InputMaybe<Scalars['String']>;
  id_contains?: InputMaybe<Scalars['String']>;
  id_in?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  id_not?: InputMaybe<Scalars['String']>;
  id_not_contains?: InputMaybe<Scalars['String']>;
  id_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  proposalCount?: InputMaybe<Scalars['Int']>;
  proposalCount_gt?: InputMaybe<Scalars['Int']>;
  proposalCount_gte?: InputMaybe<Scalars['Int']>;
  proposalCount_in?: InputMaybe<Array<InputMaybe<Scalars['Int']>>>;
  proposalCount_lt?: InputMaybe<Scalars['Int']>;
  proposalCount_lte?: InputMaybe<Scalars['Int']>;
  proposalCount_not?: InputMaybe<Scalars['Int']>;
  proposalCount_not_in?: InputMaybe<Array<InputMaybe<Scalars['Int']>>>;
  voteCount?: InputMaybe<Scalars['Int']>;
  voteCount_gt?: InputMaybe<Scalars['Int']>;
  voteCount_gte?: InputMaybe<Scalars['Int']>;
  voteCount_in?: InputMaybe<Array<InputMaybe<Scalars['Int']>>>;
  voteCount_lt?: InputMaybe<Scalars['Int']>;
  voteCount_lte?: InputMaybe<Scalars['Int']>;
  voteCount_not?: InputMaybe<Scalars['Int']>;
  voteCount_not_in?: InputMaybe<Array<InputMaybe<Scalars['Int']>>>;
};

export type WhereProposal = {
  body?: InputMaybe<Scalars['String']>;
  body_contains?: InputMaybe<Scalars['String']>;
  body_in?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  body_not?: InputMaybe<Scalars['String']>;
  body_not_contains?: InputMaybe<Scalars['String']>;
  body_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  id?: InputMaybe<Scalars['String']>;
  id_contains?: InputMaybe<Scalars['String']>;
  id_in?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  id_not?: InputMaybe<Scalars['String']>;
  id_not_contains?: InputMaybe<Scalars['String']>;
  id_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  isCancelled?: InputMaybe<Scalars['Boolean']>;
  isCancelled_in?: InputMaybe<Array<InputMaybe<Scalars['Boolean']>>>;
  isCancelled_not?: InputMaybe<Scalars['Boolean']>;
  isCancelled_not_in?: InputMaybe<Array<InputMaybe<Scalars['Boolean']>>>;
  isWinner?: InputMaybe<Scalars['Boolean']>;
  isWinner_in?: InputMaybe<Array<InputMaybe<Scalars['Boolean']>>>;
  isWinner_not?: InputMaybe<Scalars['Boolean']>;
  isWinner_not_in?: InputMaybe<Array<InputMaybe<Scalars['Boolean']>>>;
  metadataUri?: InputMaybe<Scalars['String']>;
  metadataUri_contains?: InputMaybe<Scalars['String']>;
  metadataUri_in?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  metadataUri_not?: InputMaybe<Scalars['String']>;
  metadataUri_not_contains?: InputMaybe<Scalars['String']>;
  metadataUri_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  proposalId?: InputMaybe<Scalars['Int']>;
  proposalId_gt?: InputMaybe<Scalars['Int']>;
  proposalId_gte?: InputMaybe<Scalars['Int']>;
  proposalId_in?: InputMaybe<Array<InputMaybe<Scalars['Int']>>>;
  proposalId_lt?: InputMaybe<Scalars['Int']>;
  proposalId_lte?: InputMaybe<Scalars['Int']>;
  proposalId_not?: InputMaybe<Scalars['Int']>;
  proposalId_not_in?: InputMaybe<Array<InputMaybe<Scalars['Int']>>>;
  proposer?: InputMaybe<Scalars['String']>;
  proposer_contains?: InputMaybe<Scalars['String']>;
  proposer_in?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  proposer_not?: InputMaybe<Scalars['String']>;
  proposer_not_contains?: InputMaybe<Scalars['String']>;
  proposer_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  receivedAt?: InputMaybe<Scalars['Int']>;
  receivedAt_gt?: InputMaybe<Scalars['Int']>;
  receivedAt_gte?: InputMaybe<Scalars['Int']>;
  receivedAt_in?: InputMaybe<Array<InputMaybe<Scalars['Int']>>>;
  receivedAt_lt?: InputMaybe<Scalars['Int']>;
  receivedAt_lte?: InputMaybe<Scalars['Int']>;
  receivedAt_not?: InputMaybe<Scalars['Int']>;
  receivedAt_not_in?: InputMaybe<Array<InputMaybe<Scalars['Int']>>>;
  round?: InputMaybe<Scalars['String']>;
  round_contains?: InputMaybe<Scalars['String']>;
  round_in?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  round_not?: InputMaybe<Scalars['String']>;
  round_not_contains?: InputMaybe<Scalars['String']>;
  round_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  title?: InputMaybe<Scalars['String']>;
  title_contains?: InputMaybe<Scalars['String']>;
  title_in?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  title_not?: InputMaybe<Scalars['String']>;
  title_not_contains?: InputMaybe<Scalars['String']>;
  title_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  tx?: InputMaybe<Scalars['String']>;
  tx_contains?: InputMaybe<Scalars['String']>;
  tx_in?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  tx_not?: InputMaybe<Scalars['String']>;
  tx_not_contains?: InputMaybe<Scalars['String']>;
  tx_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  voteCount?: InputMaybe<Scalars['Int']>;
  voteCount_gt?: InputMaybe<Scalars['Int']>;
  voteCount_gte?: InputMaybe<Scalars['Int']>;
  voteCount_in?: InputMaybe<Array<InputMaybe<Scalars['Int']>>>;
  voteCount_lt?: InputMaybe<Scalars['Int']>;
  voteCount_lte?: InputMaybe<Scalars['Int']>;
  voteCount_not?: InputMaybe<Scalars['Int']>;
  voteCount_not_in?: InputMaybe<Array<InputMaybe<Scalars['Int']>>>;
};

export type WhereRound = {
  id?: InputMaybe<Scalars['String']>;
  id_contains?: InputMaybe<Scalars['String']>;
  id_in?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  id_not?: InputMaybe<Scalars['String']>;
  id_not_contains?: InputMaybe<Scalars['String']>;
  id_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  proposalCount?: InputMaybe<Scalars['Int']>;
  proposalCount_gt?: InputMaybe<Scalars['Int']>;
  proposalCount_gte?: InputMaybe<Scalars['Int']>;
  proposalCount_in?: InputMaybe<Array<InputMaybe<Scalars['Int']>>>;
  proposalCount_lt?: InputMaybe<Scalars['Int']>;
  proposalCount_lte?: InputMaybe<Scalars['Int']>;
  proposalCount_not?: InputMaybe<Scalars['Int']>;
  proposalCount_not_in?: InputMaybe<Array<InputMaybe<Scalars['Int']>>>;
  registeredAt?: InputMaybe<Scalars['Int']>;
  registeredAt_gt?: InputMaybe<Scalars['Int']>;
  registeredAt_gte?: InputMaybe<Scalars['Int']>;
  registeredAt_in?: InputMaybe<Array<InputMaybe<Scalars['Int']>>>;
  registeredAt_lt?: InputMaybe<Scalars['Int']>;
  registeredAt_lte?: InputMaybe<Scalars['Int']>;
  registeredAt_not?: InputMaybe<Scalars['Int']>;
  registeredAt_not_in?: InputMaybe<Array<InputMaybe<Scalars['Int']>>>;
  sourceChainRound?: InputMaybe<Scalars['String']>;
  sourceChainRound_contains?: InputMaybe<Scalars['String']>;
  sourceChainRound_in?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  sourceChainRound_not?: InputMaybe<Scalars['String']>;
  sourceChainRound_not_contains?: InputMaybe<Scalars['String']>;
  sourceChainRound_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  state?: InputMaybe<Scalars['String']>;
  state_contains?: InputMaybe<Scalars['String']>;
  state_in?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  state_not?: InputMaybe<Scalars['String']>;
  state_not_contains?: InputMaybe<Scalars['String']>;
  state_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  tx?: InputMaybe<Scalars['String']>;
  tx_contains?: InputMaybe<Scalars['String']>;
  tx_in?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  tx_not?: InputMaybe<Scalars['String']>;
  tx_not_contains?: InputMaybe<Scalars['String']>;
  tx_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  type?: InputMaybe<Scalars['String']>;
  type_contains?: InputMaybe<Scalars['String']>;
  type_in?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  type_not?: InputMaybe<Scalars['String']>;
  type_not_contains?: InputMaybe<Scalars['String']>;
  type_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  voteCount?: InputMaybe<Scalars['Int']>;
  voteCount_gt?: InputMaybe<Scalars['Int']>;
  voteCount_gte?: InputMaybe<Scalars['Int']>;
  voteCount_in?: InputMaybe<Array<InputMaybe<Scalars['Int']>>>;
  voteCount_lt?: InputMaybe<Scalars['Int']>;
  voteCount_lte?: InputMaybe<Scalars['Int']>;
  voteCount_not?: InputMaybe<Scalars['Int']>;
  voteCount_not_in?: InputMaybe<Array<InputMaybe<Scalars['Int']>>>;
};

export type WhereSummary = {
  id?: InputMaybe<Scalars['String']>;
  id_contains?: InputMaybe<Scalars['String']>;
  id_in?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  id_not?: InputMaybe<Scalars['String']>;
  id_not_contains?: InputMaybe<Scalars['String']>;
  id_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  proposalCount?: InputMaybe<Scalars['Int']>;
  proposalCount_gt?: InputMaybe<Scalars['Int']>;
  proposalCount_gte?: InputMaybe<Scalars['Int']>;
  proposalCount_in?: InputMaybe<Array<InputMaybe<Scalars['Int']>>>;
  proposalCount_lt?: InputMaybe<Scalars['Int']>;
  proposalCount_lte?: InputMaybe<Scalars['Int']>;
  proposalCount_not?: InputMaybe<Scalars['Int']>;
  proposalCount_not_in?: InputMaybe<Array<InputMaybe<Scalars['Int']>>>;
  roundCount?: InputMaybe<Scalars['Int']>;
  roundCount_gt?: InputMaybe<Scalars['Int']>;
  roundCount_gte?: InputMaybe<Scalars['Int']>;
  roundCount_in?: InputMaybe<Array<InputMaybe<Scalars['Int']>>>;
  roundCount_lt?: InputMaybe<Scalars['Int']>;
  roundCount_lte?: InputMaybe<Scalars['Int']>;
  roundCount_not?: InputMaybe<Scalars['Int']>;
  roundCount_not_in?: InputMaybe<Array<InputMaybe<Scalars['Int']>>>;
  voteSubmissionCount?: InputMaybe<Scalars['Int']>;
  voteSubmissionCount_gt?: InputMaybe<Scalars['Int']>;
  voteSubmissionCount_gte?: InputMaybe<Scalars['Int']>;
  voteSubmissionCount_in?: InputMaybe<Array<InputMaybe<Scalars['Int']>>>;
  voteSubmissionCount_lt?: InputMaybe<Scalars['Int']>;
  voteSubmissionCount_lte?: InputMaybe<Scalars['Int']>;
  voteSubmissionCount_not?: InputMaybe<Scalars['Int']>;
  voteSubmissionCount_not_in?: InputMaybe<Array<InputMaybe<Scalars['Int']>>>;
};

export type WhereVote = {
  id?: InputMaybe<Scalars['String']>;
  id_contains?: InputMaybe<Scalars['String']>;
  id_in?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  id_not?: InputMaybe<Scalars['String']>;
  id_not_contains?: InputMaybe<Scalars['String']>;
  id_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  proposal?: InputMaybe<Scalars['String']>;
  proposal_contains?: InputMaybe<Scalars['String']>;
  proposal_in?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  proposal_not?: InputMaybe<Scalars['String']>;
  proposal_not_contains?: InputMaybe<Scalars['String']>;
  proposal_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  receivedAt?: InputMaybe<Scalars['Int']>;
  receivedAt_gt?: InputMaybe<Scalars['Int']>;
  receivedAt_gte?: InputMaybe<Scalars['Int']>;
  receivedAt_in?: InputMaybe<Array<InputMaybe<Scalars['Int']>>>;
  receivedAt_lt?: InputMaybe<Scalars['Int']>;
  receivedAt_lte?: InputMaybe<Scalars['Int']>;
  receivedAt_not?: InputMaybe<Scalars['Int']>;
  receivedAt_not_in?: InputMaybe<Array<InputMaybe<Scalars['Int']>>>;
  round?: InputMaybe<Scalars['String']>;
  round_contains?: InputMaybe<Scalars['String']>;
  round_in?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  round_not?: InputMaybe<Scalars['String']>;
  round_not_contains?: InputMaybe<Scalars['String']>;
  round_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  tx?: InputMaybe<Scalars['String']>;
  tx_contains?: InputMaybe<Scalars['String']>;
  tx_in?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  tx_not?: InputMaybe<Scalars['String']>;
  tx_not_contains?: InputMaybe<Scalars['String']>;
  tx_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  voter?: InputMaybe<Scalars['String']>;
  voter_contains?: InputMaybe<Scalars['String']>;
  voter_in?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  voter_not?: InputMaybe<Scalars['String']>;
  voter_not_contains?: InputMaybe<Scalars['String']>;
  voter_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  votingPower?: InputMaybe<Scalars['Int']>;
  votingPower_gt?: InputMaybe<Scalars['Int']>;
  votingPower_gte?: InputMaybe<Scalars['Int']>;
  votingPower_in?: InputMaybe<Array<InputMaybe<Scalars['Int']>>>;
  votingPower_lt?: InputMaybe<Scalars['Int']>;
  votingPower_lte?: InputMaybe<Scalars['Int']>;
  votingPower_not?: InputMaybe<Scalars['Int']>;
  votingPower_not_in?: InputMaybe<Array<InputMaybe<Scalars['Int']>>>;
};

export type Where_Checkpoint = {
  block_number?: InputMaybe<Scalars['Int']>;
  block_number_gt?: InputMaybe<Scalars['Int']>;
  block_number_gte?: InputMaybe<Scalars['Int']>;
  block_number_in?: InputMaybe<Array<InputMaybe<Scalars['Int']>>>;
  block_number_lt?: InputMaybe<Scalars['Int']>;
  block_number_lte?: InputMaybe<Scalars['Int']>;
  block_number_not?: InputMaybe<Scalars['Int']>;
  block_number_not_in?: InputMaybe<Array<InputMaybe<Scalars['Int']>>>;
  contract_address?: InputMaybe<Scalars['String']>;
  contract_address_contains?: InputMaybe<Scalars['String']>;
  contract_address_in?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  contract_address_not?: InputMaybe<Scalars['String']>;
  contract_address_not_contains?: InputMaybe<Scalars['String']>;
  contract_address_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  id?: InputMaybe<Scalars['ID']>;
  id_in?: InputMaybe<Array<InputMaybe<Scalars['ID']>>>;
  id_not?: InputMaybe<Scalars['ID']>;
  id_not_in?: InputMaybe<Array<InputMaybe<Scalars['ID']>>>;
};

export type Where_Metadata = {
  id?: InputMaybe<Scalars['ID']>;
  id_in?: InputMaybe<Array<InputMaybe<Scalars['ID']>>>;
  id_not?: InputMaybe<Scalars['ID']>;
  id_not_in?: InputMaybe<Array<InputMaybe<Scalars['ID']>>>;
  value?: InputMaybe<Scalars['String']>;
  value_contains?: InputMaybe<Scalars['String']>;
  value_in?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  value_not?: InputMaybe<Scalars['String']>;
  value_not_contains?: InputMaybe<Scalars['String']>;
  value_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
};

/** Contract and Block where its event is found. */
export type _Checkpoint = {
  __typename?: '_Checkpoint';
  block_number: Scalars['Int'];
  contract_address: Scalars['String'];
  /** id computed as last 5 bytes of sha256(contract+block) */
  id: Scalars['ID'];
};

/** Core metadata values used internally by Checkpoint */
export type _Metadata = {
  __typename?: '_Metadata';
  /** example: last_indexed_block */
  id: Scalars['ID'];
  value?: Maybe<Scalars['String']>;
};

export type GlobalStatsQueryVariables = Exact<{ [key: string]: never }>;

export type GlobalStatsQuery = {
  __typename?: 'Query';
  summary?: {
    __typename?: 'Summary';
    roundCount: number;
    proposalCount: number;
    voteSubmissionCount: number;
  } | null;
};

export type ManyProposalsForRoundQueryVariables = Exact<{
  round: Scalars['String'];
  first: Scalars['Int'];
  skip: Scalars['Int'];
  orderBy?: InputMaybe<OrderByProposalFields>;
  orderDirection?: InputMaybe<OrderDirection>;
}>;

export type ManyProposalsForRoundQuery = {
  __typename?: 'Query';
  proposals?: Array<{
    __typename?: 'Proposal';
    id: string;
    proposalId: number;
    metadataUri: string;
    title: string;
    body: string;
    isCancelled: boolean;
    isWinner: boolean;
    receivedAt: number;
    tx?: string | null;
    voteCount: number;
    proposer: { __typename?: 'Account'; id: string };
  } | null> | null;
};

export type ManyProposalsByAccountQueryVariables = Exact<{
  proposer: Scalars['String'];
  first: Scalars['Int'];
  skip: Scalars['Int'];
  orderBy?: InputMaybe<OrderByProposalFields>;
  orderDirection?: InputMaybe<OrderDirection>;
}>;

export type ManyProposalsByAccountQuery = {
  __typename?: 'Query';
  proposals?: Array<{
    __typename?: 'Proposal';
    id: string;
    proposalId: number;
    metadataUri: string;
    title: string;
    body: string;
    isCancelled: boolean;
    isWinner: boolean;
    receivedAt: number;
    tx?: string | null;
    voteCount: number;
  } | null> | null;
};

export type ManyVotesByAccountQueryVariables = Exact<{
  voter: Scalars['String'];
  first: Scalars['Int'];
  skip: Scalars['Int'];
  orderBy?: InputMaybe<OrderByVoteFields>;
  orderDirection?: InputMaybe<OrderDirection>;
}>;

export type ManyVotesByAccountQuery = {
  __typename?: 'Query';
  votes?: Array<{
    __typename?: 'Vote';
    id: string;
    votingPower: number;
    receivedAt: number;
    tx?: string | null;
    round: { __typename?: 'Round'; id: string };
    proposal: { __typename?: 'Proposal'; id: string };
  } | null> | null;
};

export const GlobalStatsDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'globalStats' },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'summary' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'id' },
                value: { kind: 'StringValue', value: 'SUMMARY', block: false },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'roundCount' } },
                { kind: 'Field', name: { kind: 'Name', value: 'proposalCount' } },
                { kind: 'Field', name: { kind: 'Name', value: 'voteSubmissionCount' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<GlobalStatsQuery, GlobalStatsQueryVariables>;
export const ManyProposalsForRoundDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'manyProposalsForRound' },
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
          type: { kind: 'NamedType', name: { kind: 'Name', value: 'OrderByProposalFields' } },
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
            name: { kind: 'Name', value: 'proposals' },
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
                { kind: 'Field', name: { kind: 'Name', value: 'proposalId' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'proposer' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [{ kind: 'Field', name: { kind: 'Name', value: 'id' } }],
                  },
                },
                { kind: 'Field', name: { kind: 'Name', value: 'metadataUri' } },
                { kind: 'Field', name: { kind: 'Name', value: 'title' } },
                { kind: 'Field', name: { kind: 'Name', value: 'body' } },
                { kind: 'Field', name: { kind: 'Name', value: 'isCancelled' } },
                { kind: 'Field', name: { kind: 'Name', value: 'isWinner' } },
                { kind: 'Field', name: { kind: 'Name', value: 'receivedAt' } },
                { kind: 'Field', name: { kind: 'Name', value: 'tx' } },
                { kind: 'Field', name: { kind: 'Name', value: 'voteCount' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<ManyProposalsForRoundQuery, ManyProposalsForRoundQueryVariables>;
export const ManyProposalsByAccountDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'manyProposalsByAccount' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'proposer' } },
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
          type: { kind: 'NamedType', name: { kind: 'Name', value: 'OrderByProposalFields' } },
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
            name: { kind: 'Name', value: 'proposals' },
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
                      name: { kind: 'Name', value: 'proposer' },
                      value: { kind: 'Variable', name: { kind: 'Name', value: 'proposer' } },
                    },
                  ],
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'proposalId' } },
                { kind: 'Field', name: { kind: 'Name', value: 'metadataUri' } },
                { kind: 'Field', name: { kind: 'Name', value: 'title' } },
                { kind: 'Field', name: { kind: 'Name', value: 'body' } },
                { kind: 'Field', name: { kind: 'Name', value: 'isCancelled' } },
                { kind: 'Field', name: { kind: 'Name', value: 'isWinner' } },
                { kind: 'Field', name: { kind: 'Name', value: 'receivedAt' } },
                { kind: 'Field', name: { kind: 'Name', value: 'tx' } },
                { kind: 'Field', name: { kind: 'Name', value: 'voteCount' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<ManyProposalsByAccountQuery, ManyProposalsByAccountQueryVariables>;
export const ManyVotesByAccountDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'manyVotesByAccount' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'voter' } },
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
          type: { kind: 'NamedType', name: { kind: 'Name', value: 'OrderByVoteFields' } },
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
            name: { kind: 'Name', value: 'votes' },
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
                      name: { kind: 'Name', value: 'voter' },
                      value: { kind: 'Variable', name: { kind: 'Name', value: 'voter' } },
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
                  name: { kind: 'Name', value: 'round' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [{ kind: 'Field', name: { kind: 'Name', value: 'id' } }],
                  },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'proposal' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [{ kind: 'Field', name: { kind: 'Name', value: 'id' } }],
                  },
                },
                { kind: 'Field', name: { kind: 'Name', value: 'votingPower' } },
                { kind: 'Field', name: { kind: 'Name', value: 'receivedAt' } },
                { kind: 'Field', name: { kind: 'Name', value: 'tx' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<ManyVotesByAccountQuery, ManyVotesByAccountQueryVariables>;
