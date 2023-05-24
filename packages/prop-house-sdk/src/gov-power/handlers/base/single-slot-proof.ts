import { encoding, storageProofs } from '../../../utils';
import { BigNumber } from '@ethersproject/bignumber';
import { hexZeroPad } from '@ethersproject/bytes';
import { StrategyHandlerBase } from './base';

// prettier-ignore
export abstract class SingleSlotProofHandler<CS> extends StrategyHandlerBase<CS> {
  protected readonly _TIMESTAMP_TO_ETH_BLOCK_NUMBER_STORE = 'Timestamp_timestamp_to_eth_block_number';
  protected readonly _L1_LATEST_BLOCK_STORE = '_latest_l1_block';

  // TODO: Consider additional function that takes strategy address and params

  /**
   * Fetches the inputs required to prove a mapping storage key
   * @param account The user account address
   * @param timestamp The timestamp used to query the block for the proof
   * @param strategyId The governance power strategy ID
   */
  protected async fetchProofInputs(account: string, timestamp: string, strategyId: string) {
    const strategy = await this.getStrategyAddressAndParams(strategyId);
    const block = await this.getBlockNumberForTimestamp(strategy.addr, timestamp);

    const result = await this.provider.send('eth_getProof', [
      hexZeroPad(strategy.params[0], 20), // Contract Address
      [encoding.getSlotKey(account, strategy.params[1])], // Storage Key
      `0x${block.toString(16)}`, // Block Number
    ]);
    return storageProofs.getProofInputs(block, result);
  }

  /**
   * Get the block number for the given timestamp. Fetch the latest block number
   * from the header store is not present in the governance power strategy store.
   * @param strategy The governance power strategy address
   * @param timestamp The unix timestamp
   */
  protected async getBlockNumberForTimestamp(strategy: string, timestamp: string | number) {
    let block = await this.getBlockNumberFromStrategy(strategy, timestamp);
    if (!block) {
      block = await this.getLatestBlockNumberFromHeadersStore();
    }
    return block;
  }

  /**
   * Get the block number for the given timestamp stored on the governance power strategy
   * @param strategy The governance power strategy address
   * @param timestamp The unix timestamp
   */
  protected async getBlockNumberFromStrategy(strategy: string, timestamp: string | number) {
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
          this._addresses.starknet.herodotus.l1HeadersStore,
          encoding.getStorageVarAddress(this._L1_LATEST_BLOCK_STORE),
        )
      ).toString(),
      16,
    );
    // 1 block offset due to https://tinyurl.com/nzz5dyyx
    return block - 1;
  }
}
