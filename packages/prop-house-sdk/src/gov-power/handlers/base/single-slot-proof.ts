import { encoding, storageProofs } from '../../../utils';
import { BigNumber } from '@ethersproject/bignumber';
import { hexZeroPad } from '@ethersproject/bytes';
import { StrategyHandlerBase } from './base';

// prettier-ignore
export abstract class SingleSlotProofHandler<CS> extends StrategyHandlerBase<CS> {
  protected readonly _TIMESTAMP_TO_ETH_BLOCK_NUMBER_STORE = '_timestamp_to_eth_block_number';
  protected readonly _L1_LATEST_BLOCK_STORE = '_latest_l1_block';  

  /**
   * Fetches the inputs required to prove a storage key
   * @param contractAddress The address of the contract whose storage is being proven
   * @param slotKey The storage key to prove
   * @param timestamp The timestamp used to fetch the block number to prove
   */
  protected async fetchProofInputs(contractAddress: string, slotKey: string, timestamp: string | number) {
    const block = await this.getBlockNumberForTimestamp(timestamp);
    const result = await this.provider.send('eth_getProof', [
      hexZeroPad(contractAddress, 20), // Contract Address
      [slotKey], // Storage Key
      `0x${block.toString(16)}`, // Block Number
    ]);
    return storageProofs.getProofInputs(block, result);
  }

  /**
   * Get the block number for the given timestamp from the block registry. If it has not
   * been populated yet, then query the header store for the latest block number.
   * @param timestamp The unix timestamp
   */
  protected async getBlockNumberForTimestamp(timestamp: string | number) {
    let block = await this.getBlockNumberFromRegistry(timestamp);
    if (!block) {
      block = await this.getLatestBlockNumberFromHeadersStore();
    }
    return block;
  }

  /**
   * Get the block number for the given timestamp from the block registry.
   * @param timestamp The unix timestamp
   */
  protected async getBlockNumberFromRegistry(timestamp: string | number) {
    const key = encoding.getStorageVarAddress(
      this._TIMESTAMP_TO_ETH_BLOCK_NUMBER_STORE,
      BigNumber.from(timestamp).toHexString(),
    );
    const block = parseInt(
      (await this._starknet.getStorageAt(this._addresses.starknet.blockRegistry, key)).toString(),
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
