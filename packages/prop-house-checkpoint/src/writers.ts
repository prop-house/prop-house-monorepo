import type { CheckpointWriter } from 'checkpoint-beta';
import {
  getJSON,
  getRoundType,
  getTxStatus,
  intSequenceToString,
  toAddress,
  uint256toString,
  unixTimestamp,
} from './utils';
import { validateAndParseAddress } from 'starknet';
import { hexZeroPad } from '@ethersproject/bytes';
import { Proposal, RoundState } from './types';

export const handleEthereumRoundRegistered: CheckpointWriter = async ({
  block,
  blockNumber,
  tx,
  event,
  mysql,
  instance,
}) => {
  if (!event) return;

  const round = {
    id: validateAndParseAddress(event.starknet_round),
    sourceChainRound: hexZeroPad(event.origin_round, 20),
    type: getRoundType(event.round_class_hash),
    registeredAt: block?.timestamp ?? unixTimestamp(),
    txStatus: getTxStatus(block),
    txHash: tx.transaction_hash,
    state: RoundState.ACTIVE,
    proposalCount: 0,
    uniqueProposers: 0,
    uniqueVoters: 0,
  };
  instance.executeTemplate('TimedRound', {
    contract: round.id,
    start: blockNumber,
  });

  const query = `
    INSERT IGNORE INTO rounds SET ?;
    SET @added_rounds = ROW_COUNT();

    UPDATE rounds SET txStatus = ?, registeredAt = ? WHERE id = ? LIMIT 1;

    INSERT INTO summaries (id, roundCount, proposalCount, uniqueProposers, uniqueVoters)
      VALUES ('SUMMARY', 1, 0, 0, 0)
      ON DUPLICATE KEY UPDATE roundCount = roundCount + @added_rounds;
  `;
  await mysql.queryAsync(query, [round, round.txStatus, round.registeredAt, round.id]);
};

export const handleProposalCreated: CheckpointWriter = async ({
  block,
  tx,
  rawEvent,
  event,
  mysql,
}) => {
  if (!rawEvent || !event) return;

  const round = validateAndParseAddress(rawEvent.from_address);
  const proposer = toAddress(event.proposer);
  const proposalId = parseInt(event.proposal_id, 16);

  const metadata = {
    uri: '',
    title: '',
    tldr: '',
    body: '',
  };

  try {
    metadata.uri = intSequenceToString(event.metadata_uri);
  } catch (error) {
    console.log(`Failed to parse metadata URI with error: ${error}`);
  }

  if (metadata.uri) {
    try {
      const json = await getJSON(metadata.uri);

      if (json.title) metadata.title = json.title;
      if (json.tldr) metadata.tldr = json.tldr;
      if (json.body || json.what) metadata.body = json.body || json.what;
    } catch (error) {
      console.log(`Failed to fetch metadata with error: ${error}`);
    }
  }

  const timestamp = block?.timestamp ?? unixTimestamp();
  const proposal = {
    id: `${round}-${proposalId}`,
    proposalId,
    round,
    proposer,
    metadataUri: metadata.uri,
    title: metadata.title,
    tldr: metadata.tldr,
    body: metadata.body,
    isCancelled: false,
    isWinner: false,
    receivedAt: timestamp,
    txStatus: getTxStatus(block),
    txHash: tx.transaction_hash,
    votingPower: 0,
    version: 1,
  };
  const account = {
    id: proposer,
    voteCount: 0,
    proposalCount: 0,
    firstSeenAt: timestamp,
  };

  const query = `
    SELECT COUNT(*) INTO @proposer_exists FROM proposals WHERE round = ? AND proposer = ?;

    INSERT IGNORE INTO accounts SET ?;
    INSERT IGNORE INTO proposals SET ?;
    SET @added_proposals = ROW_COUNT();

    SET @is_new_proposer = IF(@proposer_exists = 0 AND @added_proposals = 1, 1, 0);
  
    UPDATE proposals SET txStatus = ?, receivedAt = ? WHERE id = ? LIMIT 1;

    UPDATE rounds SET proposalCount = proposalCount + @added_proposals,
                      uniqueProposers = uniqueProposers + @is_new_proposer
    WHERE id = ? LIMIT 1;
    UPDATE accounts SET proposalCount = proposalCount + @added_proposals WHERE id = ? LIMIT 1;
    UPDATE summaries SET proposalCount = proposalCount + @added_proposals,
                         uniqueProposers = uniqueProposers + @is_new_proposer
    WHERE id = 'SUMMARY' LIMIT 1;
  `;
  await mysql.queryAsync(query, [
    round,
    proposer,
    account,
    proposal,
    proposal.txStatus,
    proposal.receivedAt,
    proposal.id,
    round,
    proposer,
  ]);
};

export const handleProposalEdited: CheckpointWriter = async ({ block, rawEvent, event, mysql }) => {
  if (!rawEvent || !event) return;

  const round = validateAndParseAddress(rawEvent.from_address);
  const proposalId = parseInt(event.proposal_id, 16);
  const id = `${round}-${proposalId}`;

  const timestamp = block?.timestamp ?? unixTimestamp();
  const metadata = {
    uri: '',
    title: '',
    tldr: '',
    body: '',
  };

  try {
    metadata.uri = intSequenceToString(event.metadata_uri);
  } catch (error) {
    console.log(`Failed to parse metadata URI with error: ${error}`);
  }

  if (metadata.uri) {
    try {
      const json = await getJSON(metadata.uri);

      if (json.title) metadata.title = json.title;
      if (json.tldr) metadata.tldr = json.tldr;
      if (json.body || json.what) metadata.body = json.body || json.what;
    } catch (error) {
      console.log(`Failed to fetch metadata with error: ${error}`);
    }
  }

  const query = `
    UPDATE proposals SET version = version + 1,
                         lastUpdatedAt = ?,
                         metadataUri = ?,
                         title = ?,
                         tldr = ?,
                         body = ?
                     WHERE id = ? LIMIT 1;
  `;
  await mysql.queryAsync(query, [timestamp, metadata.uri, metadata.title, metadata.tldr, metadata.body, id]);
};

export const handleProposalCancelled: CheckpointWriter = async ({ rawEvent, event, mysql }) => {
  if (!rawEvent || !event) return;

  const round = validateAndParseAddress(rawEvent.from_address);
  const proposalId = parseInt(event.proposal_id, 16);
  const id = `${round}-${proposalId}`;

  await mysql.queryAsync('UPDATE proposals SET isCancelled = true WHERE id = ? LIMIT 1;', [id]);
};

export const handleVoteCast: CheckpointWriter = async ({
  block,
  tx,
  rawEvent,
  event,
  mysql,
  eventIndex,
}) => {
  if (!rawEvent || !event || eventIndex === undefined) return;

  const round = validateAndParseAddress(rawEvent.from_address);
  const voter = toAddress(event.voter);
  const power = uint256toString(event.voting_power);
  const proposalId = parseInt(event.proposal_id, 16);
  const proposal = `${round}-${proposalId}`;
  const timestamp = block?.timestamp ?? unixTimestamp();

  const vote = {
    id: `${tx.transaction_hash}-${eventIndex}`,
    voter,
    round,
    proposal,
    votingPower: power,
    receivedAt: timestamp,
    txStatus: getTxStatus(block),
    txHash: tx.transaction_hash,
  };
  const account = {
    id: voter,
    voteCount: 0,
    proposalCount: 0,
    firstSeenAt: timestamp,
  };

  const query = `
    SELECT COUNT(*) INTO @voter_exists FROM votes WHERE voter = ?;
    SELECT COUNT(*) INTO @voter_has_voted_in_round FROM votes WHERE round = ? AND voter = ?;

    INSERT IGNORE INTO accounts SET ?;
    INSERT IGNORE INTO votes SET ?;
    SET @added_votes = ROW_COUNT();

    UPDATE votes SET txStatus = ?, receivedAt = ? WHERE id = ? LIMIT 1;

    SET @is_new_voter = IF(@voter_exists = 0 AND @added_votes = 1, 1, 0);
    SET @is_new_voter_in_round = IF(@voter_has_voted_in_round = 0 AND @added_votes = 1, 1, 0);

    UPDATE rounds SET uniqueVoters = uniqueVoters + @is_new_voter_in_round WHERE id = ? LIMIT 1;
    UPDATE proposals SET votingPower = IF(@added_votes = 1, votingPower + ?, votingPower) WHERE id = ? LIMIT 1;
    UPDATE accounts SET voteCount = voteCount + @added_votes WHERE id = ? LIMIT 1;
    UPDATE summaries SET uniqueVoters = uniqueVoters + @is_new_voter WHERE id = 'SUMMARY' LIMIT 1;
  `;
  await mysql.queryAsync(query, [
    voter,
    round,
    voter,
    account,
    vote,
    vote.txStatus,
    vote.receivedAt,
    vote.id,
    round,
    power,
    proposal,
    voter,
  ]);
};

export const handleRoundFinalized: CheckpointWriter = async ({ rawEvent, event, mysql }) => {
  if (!rawEvent || !event) return;

  const round = validateAndParseAddress(rawEvent.from_address);
  const winningIds = event.winners.map(
    ({ proposal_id }: Proposal) => `${round}-${parseInt(proposal_id, 16)}`,
  );

  const query = `
    UPDATE rounds SET state = ? WHERE id = ? LIMIT 1;
    UPDATE proposals SET isWinner = true WHERE id IN ?;
  `;
  await mysql.queryAsync(query, [RoundState.FINALIZED, round, winningIds]);
};
