import { VotingStrategyConfig } from '../../../types';
import { encoding, storageProofs } from '../../../utils';
import { BigNumber } from '@ethersproject/bignumber';
import { StrategyHandlerBase } from './base';
import { hash } from 'starknet';

// prettier-ignore
export abstract class SingleSlotProofHandler<CS> extends StrategyHandlerBase<CS> {
  protected readonly _TIMESTAMP_TO_ETH_BLOCK_NUMBER_STORE = 'Timestamp_timestamp_to_eth_block_number';
  protected readonly _L1_LATEST_BLOCK_STORE = '_latest_l1_block';

  // TODO: Consider additional function that takes strategy address and params

  /**
   * Fetches the inputs required to prove a mapping storage key
   * @param account The user account address
   * @param timestamp The timestamp used to query the block for the proof
   * @param strategyId The voting strategy ID
   */
  protected async fetchProofInputs(account: string, timestamp: string, strategyId: string) {
    const strategy = await this.getStrategyAddressAndParams(strategyId);
    const block = await this.getBlockNumberFromStrategy(strategy.addr, timestamp);

    const result = await this.provider.send('eth_getProof', [
      strategy.params[0], // Contract Address
      [encoding.getSlotKey(account, strategy.params[1])], // Storage Key
      `0x${block.toString(16)}`, // Block Number
    ]);
    return storageProofs.getProofInputs(block, result);
  }

  /**
   * Get the block number for the given timestamp. Fetch the latest block number
   * from the header store is not present in the voting strategy store.
   * @param strategy The voting strategy address
   * @param timestamp The timestamp
   */
  protected async getBlockNumberForTimestamp(strategy: string, timestamp: string) {
    let block = await this.getBlockNumberFromStrategy(strategy, timestamp);
    if (!block) {
      block = await this.getLatestBlockNumberFromHeadersStore();
    }
    return block;
  }

  /**
   * Get the block number for the given timestamp stored on the voting strategy
   * @param strategy The voting strategy address
   * @param timestamp The timestamp
   */
  protected async getBlockNumberFromStrategy(strategy: string, timestamp: string) {
    const key = encoding.getStorageVarAddress(
      this._TIMESTAMP_TO_ETH_BLOCK_NUMBER_STORE,
      BigNumber.from(timestamp).toHexString(),
    );
    const block = parseInt(
      (await this._starknet.getStorageAt(strategy, key)).toString(),
      16,
    );

    // 1 block offset due to https://tinyurl.com/nzz5dyyx
    return block !== 0 ? block - 1 : block;
  }

  /**
   * Get the latest block number from the header store
   */
  protected async getLatestBlockNumberFromHeadersStore() {
    const block = parseInt(
      (
        await this._starknet.getStorageAt(
          this._addresses.starknet.fossil.l1HeadersStore,
          encoding.getStorageVarAddress(this._L1_LATEST_BLOCK_STORE),
        )
      ).toString(),
      16,
    );
    // 1 block offset due to https://tinyurl.com/nzz5dyyx
    return block - 1;
  }

  /**
   * Get the strategy address and params for the provided strategy ID
   * @param strategyId The strategy ID
   */
  protected async getStrategyAddressAndParams(strategyId: string) {
    // [strategy_addr, strategy_params_len, ...strategy_params]
    const { result } = await this._starknet.callContract({
      contractAddress: this._addresses.starknet.votingRegistry,
      entrypoint: hash.getSelectorFromName('get_voting_strategy'),
      calldata: [strategyId],
    });
    return { addr: result[0], params: result.slice(2) };
  }
}
