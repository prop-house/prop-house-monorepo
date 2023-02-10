import { hash } from 'starknet';
import { encoding, storageProofs } from '../../../utils';
import { ClientConfig, StarknetVotingStrategy } from '../../../types';
import { VOTING_STRATEGY_REGISTRY_ADDRESS } from '../constants';
import { TimedFundingRoundEnvelope, VoteMessage } from '../types';

const PROPOSAL_PERIOD_END_TIMESTAMP_STORE = 'proposal_period_end_timestamp_store';
const VOTING_STRATEGY_HASHES_STORE = 'voting_strategy_hashes_store';
const TIMESTAMP_TO_ETH_BLOCK_NUMBER_STORE = 'Timestamp_timestamp_to_eth_block_number';

const fetchStrategyParams = async (
  index: number,
  envelope: TimedFundingRoundEnvelope<VoteMessage>,
  clientConfig: ClientConfig,
): Promise<string[]> => {
  const strategyHash = await clientConfig.starkProvider.getStorageAt(
    envelope.data.message.round,
    encoding.getStorageVarAddress(VOTING_STRATEGY_HASHES_STORE, index.toString(16)),
  );
  const { result } = await clientConfig.starkProvider.callContract({
    contractAddress: VOTING_STRATEGY_REGISTRY_ADDRESS,
    entrypoint: hash.getSelectorFromName('get_voting_strategy'),
    calldata: [strategyHash],
  });
  return result.slice(2); // [strategy_addr, strategy_params_len, strategy_params]
};

const getBlockStorage = async (
  address: string,
  envelope: TimedFundingRoundEnvelope<VoteMessage>,
  clientConfig: ClientConfig,
): Promise<[string, string]> => {
  const timestamp = (
    await clientConfig.starkProvider.getStorageAt(
      envelope.data.message.round,
      encoding.getStorageVarAddress(PROPOSAL_PERIOD_END_TIMESTAMP_STORE),
    )
  ).toString();

  return [address, encoding.getStorageVarAddress(TIMESTAMP_TO_ETH_BLOCK_NUMBER_STORE, timestamp)];
};

const fetchBlock = async (
  address: string,
  envelope: TimedFundingRoundEnvelope<VoteMessage>,
  clientConfig: ClientConfig,
) => {
  const [contractAddress, key] = await getBlockStorage(address, envelope, clientConfig);
  const block = parseInt(
    (await clientConfig.starkProvider.getStorageAt(contractAddress, key)) as string,
    16,
  );

  // 1 block offset due to
  // https://github.com/snapshot-labs/sx-core/blob/e994394a7109de5527786cb99e981e132122fad4/contracts/starknet/VotingStrategies/SingleSlotProof.cairo#L60
  return block - 1;
};

const fetchProofInputs = async (
  address: string,
  index: number,
  envelope: TimedFundingRoundEnvelope<VoteMessage>,
  clientConfig: ClientConfig,
) => {
  const [block, strategyParams] = await Promise.all([
    fetchBlock(address, envelope, clientConfig),
    fetchStrategyParams(index, envelope, clientConfig),
  ]);

  const response = await fetch(clientConfig.ethUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method: 'eth_getProof',
      params: [
        strategyParams[0],
        [encoding.getSlotKey(envelope.address, strategyParams[1])],
        `0x${block.toString(16)}`,
      ],
    }),
  });

  const data = await response.json();
  if (data.error) {
    throw new Error(`Failed to fetch proofs with error: ${data.error}`);
  }

  return storageProofs.getProofInputs(block, data.result);
};

export const singleSlotProofVotingStrategy: StarknetVotingStrategy<TimedFundingRoundEnvelope> = {
  type: 'singleSlotProof',
  async getParams(
    address: string,
    index: number,
    envelope: TimedFundingRoundEnvelope<VoteMessage>,
    clientConfig: ClientConfig,
  ): Promise<string[]> {
    const {
      storageProofs: [proof],
    } = await fetchProofInputs(address, index, envelope, clientConfig);
    return proof;
  },
};
