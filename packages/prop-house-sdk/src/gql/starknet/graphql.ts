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
  first_seen_at: Scalars['Int'];
  /** The account address */
  id: Scalars['String'];
  /** The number of proposals created by the account */
  proposal_count: Scalars['Int'];
  /** All proposals submitted by the account */
  proposals: Array<Maybe<Proposal>>;
  /** The number of votes submitted by the account */
  vote_count: Scalars['Int'];
  /** All votes submitted by the account */
  votes: Array<Maybe<Vote>>;
};

export enum OrderByAccountFields {
  FirstSeenAt = 'first_seen_at',
  Id = 'id',
  ProposalCount = 'proposal_count',
  VoteCount = 'vote_count',
}

export enum OrderByProposalFields {
  Body = 'body',
  Id = 'id',
  IsCancelled = 'is_cancelled',
  IsWinner = 'is_winner',
  MetadataUri = 'metadata_uri',
  ProposalId = 'proposal_id',
  Proposer = 'proposer',
  ReceivedAt = 'received_at',
  Round = 'round',
  Title = 'title',
  Tx = 'tx',
  VoteCount = 'vote_count',
}

export enum OrderByRoundFields {
  Id = 'id',
  ProposalCount = 'proposal_count',
  RegisteredAt = 'registered_at',
  SourceChainRound = 'source_chain_round',
  State = 'state',
  Tx = 'tx',
  Type = 'type',
  VoteCount = 'vote_count',
}

export enum OrderByVoteFields {
  Id = 'id',
  Proposal = 'proposal',
  ReceivedAt = 'received_at',
  Round = 'round',
  Tx = 'tx',
  Voter = 'voter',
  VotingPower = 'voting_power',
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
  is_cancelled: Scalars['Boolean'];
  /** Whether the proposal has been selected as a winner */
  is_winner: Scalars['Boolean'];
  /** The proposal metadata URI */
  metadata_uri: Scalars['String'];
  /** The proposal ID */
  proposal_id: Scalars['Int'];
  /** The proposer account */
  proposer: Account;
  /** The unix timestamp when the proposal was received */
  received_at: Scalars['Int'];
  /** The round that the proposal was submitted to */
  round: Round;
  /** The proposal title */
  title: Scalars['String'];
  /** The transaction in which the proposal was submitted */
  tx?: Maybe<Scalars['String']>;
  /** The number of votes that the proposal has received */
  vote_count: Scalars['Int'];
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
  proposal_count: Scalars['Int'];
  /** All proposals that have been submitted to the round */
  proposals: Array<Maybe<Proposal>>;
  /** The unix timestamp when the round was registered */
  registered_at: Scalars['Int'];
  /** The round address on the source chain */
  source_chain_round: Scalars['String'];
  /** The round state */
  state: Scalars['String'];
  /** The transaction in which the round was registered */
  tx?: Maybe<Scalars['String']>;
  /** The round type (TIMED_FUNDING) */
  type: Scalars['String'];
  /** The total number of votes in the round */
  vote_count: Scalars['Int'];
  /** All votes that have been cast in the round */
  votes: Array<Maybe<Vote>>;
};

export type Vote = {
  __typename?: 'Vote';
  /** A concatenation of the vote transaction hash and log index */
  id: Scalars['String'];
  /** The proposal that was voted for */
  proposal: Proposal;
  /** The unix timestamp when the vote was received */
  received_at: Scalars['Int'];
  /** The round that the vote is in */
  round: Round;
  /** The transaction in which the votes were submitted */
  tx?: Maybe<Scalars['String']>;
  /** The voter account */
  voter: Account;
  /** The amount of voting power */
  voting_power: Scalars['Int'];
};

export type WhereAccount = {
  first_seen_at?: InputMaybe<Scalars['Int']>;
  first_seen_at_gt?: InputMaybe<Scalars['Int']>;
  first_seen_at_gte?: InputMaybe<Scalars['Int']>;
  first_seen_at_in?: InputMaybe<Array<InputMaybe<Scalars['Int']>>>;
  first_seen_at_lt?: InputMaybe<Scalars['Int']>;
  first_seen_at_lte?: InputMaybe<Scalars['Int']>;
  first_seen_at_not?: InputMaybe<Scalars['Int']>;
  first_seen_at_not_in?: InputMaybe<Array<InputMaybe<Scalars['Int']>>>;
  id?: InputMaybe<Scalars['String']>;
  id_contains?: InputMaybe<Scalars['String']>;
  id_in?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  id_not?: InputMaybe<Scalars['String']>;
  id_not_contains?: InputMaybe<Scalars['String']>;
  id_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  proposal_count?: InputMaybe<Scalars['Int']>;
  proposal_count_gt?: InputMaybe<Scalars['Int']>;
  proposal_count_gte?: InputMaybe<Scalars['Int']>;
  proposal_count_in?: InputMaybe<Array<InputMaybe<Scalars['Int']>>>;
  proposal_count_lt?: InputMaybe<Scalars['Int']>;
  proposal_count_lte?: InputMaybe<Scalars['Int']>;
  proposal_count_not?: InputMaybe<Scalars['Int']>;
  proposal_count_not_in?: InputMaybe<Array<InputMaybe<Scalars['Int']>>>;
  vote_count?: InputMaybe<Scalars['Int']>;
  vote_count_gt?: InputMaybe<Scalars['Int']>;
  vote_count_gte?: InputMaybe<Scalars['Int']>;
  vote_count_in?: InputMaybe<Array<InputMaybe<Scalars['Int']>>>;
  vote_count_lt?: InputMaybe<Scalars['Int']>;
  vote_count_lte?: InputMaybe<Scalars['Int']>;
  vote_count_not?: InputMaybe<Scalars['Int']>;
  vote_count_not_in?: InputMaybe<Array<InputMaybe<Scalars['Int']>>>;
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
  is_cancelled?: InputMaybe<Scalars['Boolean']>;
  is_cancelled_in?: InputMaybe<Array<InputMaybe<Scalars['Boolean']>>>;
  is_cancelled_not?: InputMaybe<Scalars['Boolean']>;
  is_cancelled_not_in?: InputMaybe<Array<InputMaybe<Scalars['Boolean']>>>;
  is_winner?: InputMaybe<Scalars['Boolean']>;
  is_winner_in?: InputMaybe<Array<InputMaybe<Scalars['Boolean']>>>;
  is_winner_not?: InputMaybe<Scalars['Boolean']>;
  is_winner_not_in?: InputMaybe<Array<InputMaybe<Scalars['Boolean']>>>;
  metadata_uri?: InputMaybe<Scalars['String']>;
  metadata_uri_contains?: InputMaybe<Scalars['String']>;
  metadata_uri_in?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  metadata_uri_not?: InputMaybe<Scalars['String']>;
  metadata_uri_not_contains?: InputMaybe<Scalars['String']>;
  metadata_uri_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  proposal_id?: InputMaybe<Scalars['Int']>;
  proposal_id_gt?: InputMaybe<Scalars['Int']>;
  proposal_id_gte?: InputMaybe<Scalars['Int']>;
  proposal_id_in?: InputMaybe<Array<InputMaybe<Scalars['Int']>>>;
  proposal_id_lt?: InputMaybe<Scalars['Int']>;
  proposal_id_lte?: InputMaybe<Scalars['Int']>;
  proposal_id_not?: InputMaybe<Scalars['Int']>;
  proposal_id_not_in?: InputMaybe<Array<InputMaybe<Scalars['Int']>>>;
  proposer?: InputMaybe<Scalars['String']>;
  proposer_contains?: InputMaybe<Scalars['String']>;
  proposer_in?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  proposer_not?: InputMaybe<Scalars['String']>;
  proposer_not_contains?: InputMaybe<Scalars['String']>;
  proposer_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  received_at?: InputMaybe<Scalars['Int']>;
  received_at_gt?: InputMaybe<Scalars['Int']>;
  received_at_gte?: InputMaybe<Scalars['Int']>;
  received_at_in?: InputMaybe<Array<InputMaybe<Scalars['Int']>>>;
  received_at_lt?: InputMaybe<Scalars['Int']>;
  received_at_lte?: InputMaybe<Scalars['Int']>;
  received_at_not?: InputMaybe<Scalars['Int']>;
  received_at_not_in?: InputMaybe<Array<InputMaybe<Scalars['Int']>>>;
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
  vote_count?: InputMaybe<Scalars['Int']>;
  vote_count_gt?: InputMaybe<Scalars['Int']>;
  vote_count_gte?: InputMaybe<Scalars['Int']>;
  vote_count_in?: InputMaybe<Array<InputMaybe<Scalars['Int']>>>;
  vote_count_lt?: InputMaybe<Scalars['Int']>;
  vote_count_lte?: InputMaybe<Scalars['Int']>;
  vote_count_not?: InputMaybe<Scalars['Int']>;
  vote_count_not_in?: InputMaybe<Array<InputMaybe<Scalars['Int']>>>;
};

export type WhereRound = {
  id?: InputMaybe<Scalars['String']>;
  id_contains?: InputMaybe<Scalars['String']>;
  id_in?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  id_not?: InputMaybe<Scalars['String']>;
  id_not_contains?: InputMaybe<Scalars['String']>;
  id_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  proposal_count?: InputMaybe<Scalars['Int']>;
  proposal_count_gt?: InputMaybe<Scalars['Int']>;
  proposal_count_gte?: InputMaybe<Scalars['Int']>;
  proposal_count_in?: InputMaybe<Array<InputMaybe<Scalars['Int']>>>;
  proposal_count_lt?: InputMaybe<Scalars['Int']>;
  proposal_count_lte?: InputMaybe<Scalars['Int']>;
  proposal_count_not?: InputMaybe<Scalars['Int']>;
  proposal_count_not_in?: InputMaybe<Array<InputMaybe<Scalars['Int']>>>;
  registered_at?: InputMaybe<Scalars['Int']>;
  registered_at_gt?: InputMaybe<Scalars['Int']>;
  registered_at_gte?: InputMaybe<Scalars['Int']>;
  registered_at_in?: InputMaybe<Array<InputMaybe<Scalars['Int']>>>;
  registered_at_lt?: InputMaybe<Scalars['Int']>;
  registered_at_lte?: InputMaybe<Scalars['Int']>;
  registered_at_not?: InputMaybe<Scalars['Int']>;
  registered_at_not_in?: InputMaybe<Array<InputMaybe<Scalars['Int']>>>;
  source_chain_round?: InputMaybe<Scalars['String']>;
  source_chain_round_contains?: InputMaybe<Scalars['String']>;
  source_chain_round_in?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  source_chain_round_not?: InputMaybe<Scalars['String']>;
  source_chain_round_not_contains?: InputMaybe<Scalars['String']>;
  source_chain_round_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
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
  vote_count?: InputMaybe<Scalars['Int']>;
  vote_count_gt?: InputMaybe<Scalars['Int']>;
  vote_count_gte?: InputMaybe<Scalars['Int']>;
  vote_count_in?: InputMaybe<Array<InputMaybe<Scalars['Int']>>>;
  vote_count_lt?: InputMaybe<Scalars['Int']>;
  vote_count_lte?: InputMaybe<Scalars['Int']>;
  vote_count_not?: InputMaybe<Scalars['Int']>;
  vote_count_not_in?: InputMaybe<Array<InputMaybe<Scalars['Int']>>>;
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
  received_at?: InputMaybe<Scalars['Int']>;
  received_at_gt?: InputMaybe<Scalars['Int']>;
  received_at_gte?: InputMaybe<Scalars['Int']>;
  received_at_in?: InputMaybe<Array<InputMaybe<Scalars['Int']>>>;
  received_at_lt?: InputMaybe<Scalars['Int']>;
  received_at_lte?: InputMaybe<Scalars['Int']>;
  received_at_not?: InputMaybe<Scalars['Int']>;
  received_at_not_in?: InputMaybe<Array<InputMaybe<Scalars['Int']>>>;
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
  voting_power?: InputMaybe<Scalars['Int']>;
  voting_power_gt?: InputMaybe<Scalars['Int']>;
  voting_power_gte?: InputMaybe<Scalars['Int']>;
  voting_power_in?: InputMaybe<Array<InputMaybe<Scalars['Int']>>>;
  voting_power_lt?: InputMaybe<Scalars['Int']>;
  voting_power_lte?: InputMaybe<Scalars['Int']>;
  voting_power_not?: InputMaybe<Scalars['Int']>;
  voting_power_not_in?: InputMaybe<Array<InputMaybe<Scalars['Int']>>>;
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
    proposal_id: number;
    metadata_uri: string;
    title: string;
    body: string;
    is_cancelled: boolean;
    is_winner: boolean;
    received_at: number;
    tx?: string | null;
    vote_count: number;
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
    proposal_id: number;
    metadata_uri: string;
    title: string;
    body: string;
    is_cancelled: boolean;
    is_winner: boolean;
    received_at: number;
    tx?: string | null;
    vote_count: number;
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
    voting_power: number;
    received_at: number;
    tx?: string | null;
    round: { __typename?: 'Round'; id: string };
    proposal: { __typename?: 'Proposal'; id: string };
  } | null> | null;
};

export const ManyProposalsForRoundDocument = ({
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
                { kind: 'Field', name: { kind: 'Name', value: 'proposal_id' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'proposer' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [{ kind: 'Field', name: { kind: 'Name', value: 'id' } }],
                  },
                },
                { kind: 'Field', name: { kind: 'Name', value: 'metadata_uri' } },
                { kind: 'Field', name: { kind: 'Name', value: 'title' } },
                { kind: 'Field', name: { kind: 'Name', value: 'body' } },
                { kind: 'Field', name: { kind: 'Name', value: 'is_cancelled' } },
                { kind: 'Field', name: { kind: 'Name', value: 'is_winner' } },
                { kind: 'Field', name: { kind: 'Name', value: 'received_at' } },
                { kind: 'Field', name: { kind: 'Name', value: 'tx' } },
                { kind: 'Field', name: { kind: 'Name', value: 'vote_count' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown) as DocumentNode<ManyProposalsForRoundQuery, ManyProposalsForRoundQueryVariables>;
export const ManyProposalsByAccountDocument = ({
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
                { kind: 'Field', name: { kind: 'Name', value: 'proposal_id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'metadata_uri' } },
                { kind: 'Field', name: { kind: 'Name', value: 'title' } },
                { kind: 'Field', name: { kind: 'Name', value: 'body' } },
                { kind: 'Field', name: { kind: 'Name', value: 'is_cancelled' } },
                { kind: 'Field', name: { kind: 'Name', value: 'is_winner' } },
                { kind: 'Field', name: { kind: 'Name', value: 'received_at' } },
                { kind: 'Field', name: { kind: 'Name', value: 'tx' } },
                { kind: 'Field', name: { kind: 'Name', value: 'vote_count' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown) as DocumentNode<ManyProposalsByAccountQuery, ManyProposalsByAccountQueryVariables>;
export const ManyVotesByAccountDocument = ({
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
                { kind: 'Field', name: { kind: 'Name', value: 'voting_power' } },
                { kind: 'Field', name: { kind: 'Name', value: 'received_at' } },
                { kind: 'Field', name: { kind: 'Name', value: 'tx' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown) as DocumentNode<ManyVotesByAccountQuery, ManyVotesByAccountQueryVariables>;
