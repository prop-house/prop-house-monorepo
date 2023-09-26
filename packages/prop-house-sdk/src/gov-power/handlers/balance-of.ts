import { JsonRpcProvider } from '@ethersproject/providers';
import { BalanceOfConfig, ChainConfig, GovPowerStrategyType, GovPowerConfig } from '../../types';
import { ChainId } from '@prophouse/protocol';
import { SingleSlotProofHandler } from './base';
import { storageProofs } from '../../utils';
import { BigNumber } from '@ethersproject/bignumber';
import { Contract } from '@ethersproject/contracts';
import { BALANCE_OF_FUNC } from '../../constants';
import { Call } from 'starknet';

export class BalanceOfHandler extends SingleSlotProofHandler<BalanceOfConfig> {
  // prettier-ignore
  private readonly _traceRpcs: Record<number, string> = {
    [ChainId.EthereumGoerli]: 'https://goerli.blockpi.network/v1/rpc/756ed7f20b1fcbed679bc9384c021a69ffd59cfc',
    [ChainId.EthereumMainnet]: 'https://ethereum.blockpi.network/v1/rpc/515fa4f00418c429db4f81cda04b628e7ecc7191',
    [ChainId.EthereumHardhat]: 'https://localhost:8545/',
  };
  private readonly _traceProvider: JsonRpcProvider;

  /**
   * Returns a `BalanceOfHandler` instance for the provided chain configuration
   * @param config The chain config
   */
  public static for(config: ChainConfig) {
    return new BalanceOfHandler(config);
  }

  /**
   * The governance power strategy type
   */
  public get type() {
    return GovPowerStrategyType.BALANCE_OF;
  }

  /**
   * The governance power strategy address
   */
  public get address() {
    return this._addresses.starknet.govPower.balanceOf;
  }

  /**
   * @param config The chain config
   */
  constructor(config: ChainConfig) {
    super(config);

    if (!this._traceRpcs[this._evmChainId]) {
      throw new Error(`No trace provider available for chain with ID: ${this._evmChainId}`);
    }
    this._traceProvider = new JsonRpcProvider(this._traceRpcs[this._evmChainId]);
  }

  /**
   * @notice Get the governance power strategy params that will be shared amongst all users
   * @param strategy The governance power strategy information
   */
  public async getStrategyParams(strategy: BalanceOfConfig): Promise<string[]> {
    const { slotIndex } = await storageProofs.getBalanceOfEVMStorageSlotIndex(
      this._traceProvider,
      strategy.address,
    );
    if (strategy.multiplier && BigNumber.from(strategy.multiplier).gt(1)) {
      return [strategy.address, slotIndex, strategy.multiplier.toString()];
    }
    return [strategy.address, slotIndex];
  }

  // TODO: May need to generalize this (accept custom string[])
  public async getUserParams(account: string, timestamp: string, strategyId: string) {
    const {
      storageProofs: [proof],
    } = await this.fetchProofInputs(account, timestamp, strategyId);
    return proof;
  }

  public async getStrategyPreCalls(
    account: string,
    timestamp: string,
    strategyId: string,
  ): Promise<Call[]> {
    const proofInputs = await this.fetchProofInputs(account, timestamp, strategyId);
    return [
      {
        contractAddress: this._addresses.starknet.herodotus.factRegistry,
        entrypoint: 'prove_account',
        calldata: [
          proofInputs.accountOptions,
          proofInputs.blockNumber,
          proofInputs.ethAddress.values[0],
          proofInputs.ethAddress.values[1],
          proofInputs.ethAddress.values[2],
          proofInputs.accountProofSizesBytes.length,
          ...proofInputs.accountProofSizesBytes,
          proofInputs.accountProofSizesWords.length,
          ...proofInputs.accountProofSizesWords,
          proofInputs.accountProof.length,
          ...proofInputs.accountProof,
        ],
      },
    ];
  }

  /**
   * Get the total governance power for the provided config
   * @param config The governance power strategy config information
   */
  public async getPower(config: GovPowerConfig): Promise<BigNumber> {
    const block = await this.getBlockNumberForTimestamp(config.address, config.timestamp);
    const token = BigNumber.from(config.params[0]).toHexString();
    const balance = await this.contractFor(token).balanceOf(config.user, {
      blockTag: block,
    });
    return balance.mul(config.params?.[2] ?? 1);
  }

  /**
   * Returns a contract instance for the provided token address
   * @param token The token address
   */
  private contractFor(token: string) {
    return new Contract(token, [BALANCE_OF_FUNC], this._evm);
  }
}
