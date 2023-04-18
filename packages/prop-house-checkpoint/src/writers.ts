import type { CheckpointWriter } from '@snapshot-labs/checkpoint';
import { getJSON, getRoundType, intSequenceToString, toAddress, uint256toString } from './utils';
import { validateAndParseAddress } from 'starknet';
import { Proposal, RoundState } from './types';

export const handleRoundRegistered: CheckpointWriter = async ({
  block,
  tx,
  event,
  mysql,
  instance,
}) => {
  if (!event) return;

  const round = {
    id: validateAndParseAddress(event.l2_round_address),
    sourceChainRound: event.l1_round_address,
    type: getRoundType(event.round_class_hash),
    registeredAt: block.timestamp,
    tx: tx.transaction_hash,
    state: RoundState.ACTIVE,
    proposalCount: 0,
    voteCount: 0,
  };
  instance.executeTemplate('TimedFundingRound', {
    contract: round.id,
    start: block.block_number,
  });

  const query = `
    INSERT IGNORE INTO rounds SET ?;
    INSERT INTO summaries (id, roundCount, proposalCount, voteSubmissionCount)
      VALUES ('SUMMARY', 1, 0, 0)
      ON DUPLICATE KEY UPDATE roundCount = roundCount + 1;
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

  const metadata = {
    uri: '',
    title: '',
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
      if (json.body) metadata.body = json.body;
    } catch (error) {
      console.log(`Failed to fetch metadata with error: ${error}`);
    }
  }

  const proposal = {
    id: `${round}-${event.proposal_id}`,
    proposalId: event.proposal_id,
    round,
    proposer,
    metadataUri: metadata.uri,
    title: metadata.title,
    body: metadata.body,
    isCancelled: false,
    receivedAt: block.timestamp,
    tx: tx.transaction_hash,
    voteCount: 0,
  };
  const account = {
    id: proposer,
    voteCount: 0,
    proposalCount: 0,
    firstSeenAt: block.timestamp,
  };

  const query = `
    INSERT IGNORE INTO proposals SET ?;
    UPDATE rounds SET proposalCount = proposalCount + 1 WHERE id = ? LIMIT 1;
    INSERT IGNORE INTO accounts SET ?;
    UPDATE accounts SET proposalCount = proposalCount + 1 WHERE id = ? LIMIT 1;
    UPDATE summaries SET proposalCount = proposalCount + 1 WHERE id = 'SUMMARY' LIMIT 1;
  `;
  await mysql.queryAsync(query, [proposal, proposal.round, account, proposer]);
};

export const handleProposalCancelled: CheckpointWriter = async ({ rawEvent, event, mysql }) => {
  if (!rawEvent || !event) return;

  const round = validateAndParseAddress(rawEvent.from_address);
  const id = `${round}-${event.proposal_id}`;

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
  const proposal = `${round}-${event.proposal_id}`;

  const vote = {
    id: `${tx.transaction_hash}-${eventIndex}`,
    voter,
    round,
    proposal,
    votingPower: power,
    receivedAt: block.timestamp,
    tx: tx.transaction_hash,
  };
  const account = {
    id: voter,
    voteCount: 0,
    proposalCount: 0,
    firstSeenAt: block.timestamp,
  };

  const query = `
    INSERT IGNORE INTO votes SET ?;
    UPDATE rounds SET voteCount = voteCount + 1 WHERE id = ? LIMIT 1;
    UPDATE proposals SET voteCount = voteCount + 1 WHERE id = ? LIMIT 1;
    INSERT IGNORE INTO accounts SET ?;
    UPDATE accounts SET voteCount = voteCount + 1 WHERE id = ? LIMIT 1;
    UPDATE summaries SET voteCount = voteCount + 1 WHERE id = 'SUMMARY' LIMIT 1;
  `;
  await mysql.queryAsync(query, [vote, vote.round, proposal, account, voter]);
};

export const handleRoundFinalized: CheckpointWriter = async ({ rawEvent, event, mysql }) => {
  if (!rawEvent || !event) return;

  const round = validateAndParseAddress(rawEvent.from_address);
  const winningIds = event.winners.map(({ proposal_id }: Proposal) => proposal_id);

  const query = `
    UPDATE rounds SET state = ? WHERE id = ? LIMIT 1;
    UPDATE proposals SET isWinner = true WHERE id IN ?;
  `;
  await mysql.queryAsync(query, [RoundState.FINALIZED, round, winningIds]);
};
