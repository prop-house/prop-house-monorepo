import { ChainConfig, GovPowerStrategyType, GovPowerConfig, AccountField, CheckpointableERC721Config } from '../../types';
import { SingleSlotProofHandler } from './base';
import { encoding, splitUint256, storageProofs } from '../../utils';
import { BigNumber } from '@ethersproject/bignumber';
import { Contract } from '@ethersproject/contracts';
import { GET_CURRENT_VOTES_FUNC, NUM_CHECKPOINTS_FUNC } from '../../constants';
import { Call } from 'starknet';

export class CheckpointableERC721Handler extends SingleSlotProofHandler<CheckpointableERC721Config> {
  /**
   * Information about the Nouns mainnet ERC721 token
   */
  private static readonly _NOUNS = {
    ADDRESS: '0x9c8ff314c9bc7f6e59a9d9225fb22946427edc03',
    NUM_CHECKPOINTS_SLOT_INDEX: '0x0d',
    CHECKPOINTS_SLOT_INDEX: '0x0c',
  };

  /**
   * Returns a `BalanceOfHandler` instance for the provided chain configuration
   * @param config The chain config
   */
  public static for(config: ChainConfig) {
    return new CheckpointableERC721Handler(config);
  }

  /**
   * The governance power strategy type
   */
  public get type() {
    return GovPowerStrategyType.CHECKPOINTABLE_ERC721;
  }

  /**
   * The governance power strategy address
   */
  public get address() {
    return this._addresses.starknet.govPower.checkpointableErc721;
  }

  /**
   * @notice Get the governance power strategy params that will be shared amongst all users
   * @param strategy The governance power strategy information
   */
  public async getStrategyParams(strategy: CheckpointableERC721Config): Promise<string[]> {
    if (strategy.address.toLowerCase() !== CheckpointableERC721Handler._NOUNS.ADDRESS) {
      throw new Error('This handler currently only supports the Nouns ERC721 token');
    }
    if (strategy.multiplier && BigNumber.from(strategy.multiplier).gt(1)) {
      return [
        strategy.address,
        CheckpointableERC721Handler._NOUNS.NUM_CHECKPOINTS_SLOT_INDEX,
        CheckpointableERC721Handler._NOUNS.CHECKPOINTS_SLOT_INDEX,
        strategy.multiplier.toString()
    ];
    }
    return [
      strategy.address,
      CheckpointableERC721Handler._NOUNS.NUM_CHECKPOINTS_SLOT_INDEX,
      CheckpointableERC721Handler._NOUNS.CHECKPOINTS_SLOT_INDEX,
    ];
  }

  public async getUserParams(account: string, timestamp: string, strategyId: string) {
    const strategy = await this.getStrategyAddressAndParams(strategyId);
    const [contractAddress, numCheckpointsSlotIndex, checkpointsSlotIndex] = strategy.params;

    const numCheckpointsSlotKey = encoding.getSlotKey(account, numCheckpointsSlotIndex);
    const numCheckpointsSlotKeyU256 = splitUint256.SplitUint256.fromHex(numCheckpointsSlotKey);

    const block = await this.getBlockNumberForTimestamp(timestamp);
    const numCheckpoints = await this.contractFor(contractAddress).numCheckpoints(account, {
      blockTag: block,
    });
    const checkpointToQuery = `0x${(Number(numCheckpoints) - 1).toString(16)}`;

    const checkpointsSlotKey = encoding.getNestedSlotKey([account, checkpointToQuery], checkpointsSlotIndex);
    const checkpointsSlotKeyU256 = splitUint256.SplitUint256.fromHex(checkpointsSlotKey);

    const [numCheckpointsProofInputs, checkpointsProofInputs] = await Promise.all([
      this.fetchProofInputs(contractAddress, numCheckpointsSlotKey, block),
      this.fetchProofInputs(contractAddress, checkpointsSlotKey, block),
    ]);

    const numCheckpointsUserParams = [
      // Storage Key (u256)
      numCheckpointsSlotKeyU256.low,
      numCheckpointsSlotKeyU256.high,
      // Storage Proof
      `0x${numCheckpointsProofInputs.storageProofSubArrayLength.toString(16)}`,
      ...numCheckpointsProofInputs.storageProof,
    ];
    const checkpointsUserParams = [
      // Storage Key (u256)
      checkpointsSlotKeyU256.low,
      checkpointsSlotKeyU256.high,
      // Storage Proof
      `0x${checkpointsProofInputs.storageProofSubArrayLength.toString(16)}`,
      ...checkpointsProofInputs.storageProof,
    ];
    
    
    return [
      `0x${numCheckpointsUserParams.length.toString(16)}`,
      ...numCheckpointsUserParams,
      `0x${checkpointsUserParams.length.toString(16)}`,
      ...checkpointsUserParams,
    ]
  }

  public async getStrategyPreCalls(
    account: string,
    timestamp: string,
    strategyId: string,
  ): Promise<Call[]> {
    const strategy = await this.getStrategyAddressAndParams(strategyId);
    const [contractAddress, numCheckpointsSlotIndex] = strategy.params;

    // Only the account proof is used, so it's okay to only query with the first slot key.
    const slotKey = encoding.getSlotKey(account, numCheckpointsSlotIndex);

    const block = await this.getBlockNumberForTimestamp(timestamp);
    const storageHash = await this.getStorageHash(contractAddress, block);

    // We only need to prove the account if the storage hash hasn't been populated.
    if (storageHash.isZero()) {
      const [proofInputs, processBlockInputs] = await Promise.all([
        this.fetchProofInputs(contractAddress, slotKey, block),
        storageProofs.getProcessBlockInputsForBlockNumber(
          this.provider,
          block,
          this._evmChainId,
        ),
      ]);
      return [
        {
          contractAddress: this._addresses.starknet.herodotus.factRegistry,
          entrypoint: 'prove_account',
          calldata: [
            // Account Fields
            1,
            AccountField.StorageHash,
            // Block Header RLP
            processBlockInputs.headerInts.length,
            ...processBlockInputs.headerInts,
            // Account
            contractAddress,
            // Proof
            proofInputs.accountProofSubArrayLength,
            ...proofInputs.accountProof,
          ],
        },
      ];
    }
    return [];
  }

  /**
   * Get the total governance power for the provided config
   * @param config The governance power strategy config information
   */
  public async getPower(config: GovPowerConfig): Promise<BigNumber> {
    const block = await this.getBlockNumberForTimestamp(config.timestamp);
    const token = BigNumber.from(config.params[0]).toHexString();
    const balance = await this.contractFor(token).getCurrentVotes(config.user, {
      blockTag: block,
    });
    return balance.mul(config.params?.[3] ?? 1);
  }

  /**
   * Returns a contract instance for the provided token address
   * @param token The token address
   */
  private contractFor(token: string) {
    return new Contract(token, [GET_CURRENT_VOTES_FUNC, NUM_CHECKPOINTS_FUNC], this._defaultProvider);
  }
}
