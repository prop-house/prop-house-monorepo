import type { CheckpointWriter } from '@snapshot-labs/checkpoint';
import {
  getJSON,
  getRoundType,
  intSequenceToString,
  toAddress,
  uint256toString,
  unixTimestamp,
} from './utils';
import { validateAndParseAddress } from 'starknet';
import { hexZeroPad } from '@ethersproject/bytes';
import { Proposal, RoundState } from './types';

export const handleRoundRegistered: CheckpointWriter = async ({
  block,
  blockNumber,
  tx,
  event,
  mysql,
  instance,
}) => {
  if (!event) return;

  const round = {
    id: validateAndParseAddress(event.l2_round_address),
    sourceChainRound: hexZeroPad(event.l1_round_address, 20),
    type: getRoundType(event.round_class_hash),
    registeredAt: block?.timestamp ?? unixTimestamp(),
    txHash: tx.transaction_hash,
    state: RoundState.ACTIVE,
    proposalCount: 0,
    uniqueProposers: 0,
    uniqueVoters: 0,
  };
  instance.executeTemplate('TimedFundingRound', {
    contract: round.id,
    start: blockNumber,
  });

  const query = `
    INSERT IGNORE INTO rounds SET ?;
    SET @added_rounds = ROW_COUNT();
    INSERT INTO summaries (id, roundCount, proposalCount, uniqueProposers, uniqueVoters)
      VALUES ('SUMMARY', 1, 0, 0, 0)
      ON DUPLICATE KEY UPDATE roundCount = roundCount + @added_rounds;
  `;
  await mysql.queryAsync(query, [round]);
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
  const proposer = toAddress(event.proposer_address);
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
    receivedAt: timestamp,
    txHash: tx.transaction_hash,
    votingPower: 0,
  };
  const account = {
    id: proposer,
    voteCount: 0,
    proposalCount: 0,
    firstSeenAt: timestamp,
  };

  const query = `
    INSERT IGNORE INTO accounts SET ?;
    INSERT IGNORE INTO proposals SET ?;
    SET @added_proposals = ROW_COUNT();

    SELECT COUNT(*) INTO @proposer_exists FROM proposals WHERE round = ? AND proposer = ?;
    SET @is_new_proposer = IF(@proposer_exists = 0 AND @added_proposals = 1, 1, 0);

    UPDATE rounds SET proposalCount = proposalCount + @added_proposals,
                      uniqueProposers = uniqueProposers + @is_new_proposer
    WHERE id = ? LIMIT 1;
    UPDATE accounts SET proposalCount = proposalCount + @added_proposals WHERE id = ? LIMIT 1;
    UPDATE summaries SET proposalCount = proposalCount + @added_proposals,
                         uniqueProposers = uniqueProposers + @is_new_proposer
    WHERE id = 'SUMMARY' LIMIT 1;
  `;
  await mysql.queryAsync(query, [account, proposal, round, proposer, round, proposer]);
};

export const handleProposalCancelled: CheckpointWriter = async ({ rawEvent, event, mysql }) => {
  if (!rawEvent || !event) return;

  const round = validateAndParseAddress(rawEvent.from_address);
  const proposalId = parseInt(event.proposal_id, 16);
  const id = `${round}-${proposalId}`;

  await mysql.queryAsync('UPDATE proposals SET isCancelled = true WHERE id = ? LIMIT 1;', [id]);
};

export const handleVoteCreated: CheckpointWriter = async ({
  block,
  tx,
  rawEvent,
  event,
  mysql,
  eventIndex,
}) => {
  if (!rawEvent || !event || !eventIndex) return;

  const round = validateAndParseAddress(rawEvent.from_address);
  const voter = toAddress(event.voter_address);
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
    txHash: tx.transaction_hash,
  };
  const account = {
    id: voter,
    voteCount: 0,
    proposalCount: 0,
    firstSeenAt: timestamp,
  };

  const query = `
    INSERT IGNORE INTO accounts SET ?;
    INSERT IGNORE INTO votes SET ?;
    SET @added_votes = ROW_COUNT();

    SELECT COUNT(*) INTO @voter_exists FROM votes WHERE round = ? AND voter = ?;
    SET @is_new_voter = IF(@voter_exists = 0 AND @added_votes = 1, 1, 0);

    UPDATE rounds SET uniqueVoters = uniqueVoters + @is_new_voter WHERE id = ? LIMIT 1;
    UPDATE proposals SET votingPower = IF(@added_votes = 1, votingPower + ?, votingPower) WHERE id = ? LIMIT 1;
    UPDATE accounts SET voteCount = voteCount + @added_votes WHERE id = ? LIMIT 1;
    UPDATE summaries SET uniqueVoters = uniqueVoters + @is_new_voter WHERE id = 'SUMMARY' LIMIT 1;
  `;
  await mysql.queryAsync(query, [account, vote, round, voter, round, power, proposal, voter]);
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
