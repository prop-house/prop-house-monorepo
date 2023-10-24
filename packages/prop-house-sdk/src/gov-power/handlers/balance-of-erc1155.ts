import { JsonRpcProvider } from '@ethersproject/providers';
import { BalanceOfERC1155Config, ChainConfig, GovPowerStrategyType, GovPowerConfig } from '../../types';
import { ChainId } from '@prophouse/protocol';
import { SingleSlotProofHandler } from './base';
import { encoding, storageProofs } from '../../utils';
import { BigNumber } from '@ethersproject/bignumber';
import { Contract } from '@ethersproject/contracts';
import { ADDRESS_ONE, BALANCE_OF_ERC1155_FUNC } from '../../constants';
import { Call } from 'starknet';
import { Zero } from '@ethersproject/constants';

export class BalanceOfERC1155Handler extends SingleSlotProofHandler<BalanceOfERC1155Config> {
  // prettier-ignore
  private readonly _traceRpcs: Record<number, string> = {
    [ChainId.EthereumGoerli]: 'https://goerli.blockpi.network/v1/rpc/756ed7f20b1fcbed679bc9384c021a69ffd59cfc',
    [ChainId.EthereumMainnet]: 'https://ethereum.blockpi.network/v1/rpc/515fa4f00418c429db4f81cda04b628e7ecc7191',
    [ChainId.EthereumHardhat]: 'https://localhost:8545/',
  };
  private readonly _traceProvider: JsonRpcProvider;

  /**
   * Returns a `BalanceOfERC1155Handler` instance for the provided chain configuration
   * @param config The chain config
   */
  public static for(config: ChainConfig) {
    return new BalanceOfERC1155Handler(config);
  }

  /**
   * The governance power strategy type
   */
  public get type() {
    return GovPowerStrategyType.BALANCE_OF_ERC1155;
  }

  /**
   * The governance power strategy address
   */
  public get address() {
    return this._addresses.starknet.govPower.balanceOfErc1155;
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
  public async getStrategyParams(strategy: BalanceOfERC1155Config): Promise<string[]> {
    const { slotIndex } = await storageProofs.getSlotIndexOfQueriedMapping(
      this._traceProvider,
      strategy.address,
      'balanceOf',
      [ADDRESS_ONE, Zero],
    );
    if (strategy.multiplier && BigNumber.from(strategy.multiplier).gt(1)) {
      return [strategy.address, slotIndex, strategy.tokenId, strategy.multiplier.toString()];
    }
    return [strategy.address, slotIndex, strategy.tokenId];
  }

  // TODO: May need to generalize this (accept custom string[])
  public async getUserParams(account: string, timestamp: string, strategyId: string) {
    const strategy = await this.getStrategyAddressAndParams(strategyId);
    const slotKey = encoding.getNestedSlotKey([account, strategy.params[2]], strategy.params[1]);
    const {
      storageProofs: [proof],
    } = await this.fetchProofInputs(strategy.params[0], slotKey, timestamp);
    return proof;
  }

  public async getStrategyPreCalls(
    account: string,
    timestamp: string,
    strategyId: string,
  ): Promise<Call[]> {
    const strategy = await this.getStrategyAddressAndParams(strategyId);
    const slotKey = encoding.getNestedSlotKey([account, strategy.params[2]], strategy.params[1]);
    const proofInputs = await this.fetchProofInputs(strategy.params[0], slotKey, timestamp);
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
    const block = await this.getBlockNumberForTimestamp(config.timestamp);
    const token = BigNumber.from(config.params[0]).toHexString();
    const balance = await this.contractFor(token).balanceOf(config.user, config.params[2], {
      blockTag: block,
    });
    return balance.mul(config.params?.[3] ?? 1);
  }

  /**
   * Returns a contract instance for the provided token address
   * @param token The token address
   */
  private contractFor(token: string) {
    return new Contract(token, [BALANCE_OF_ERC1155_FUNC], this._evm);
  }
}
