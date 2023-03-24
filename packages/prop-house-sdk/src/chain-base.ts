import {
  ChainId,
  ContractAddresses,
  getContractAddressesForChainOrThrow,
} from '@prophouse/contracts';
import { constants, SequencerProvider } from 'starknet';
import { JsonRpcProvider, Web3Provider } from '@ethersproject/providers';
import { Wallet } from '@ethersproject/wallet';
import { ChainConfig } from './types';

export class ChainBase {
  protected readonly _evmChainId: number;
  protected readonly _addresses: ContractAddresses;
  protected readonly _evm: JsonRpcProvider | Wallet;
  protected readonly _starknet: SequencerProvider;

  /**
   * EVM to Starknet chain ID mappings
   */
  public static readonly EVM_TO_STARKNET_CHAIN_ID: Record<number, constants.StarknetChainId> = {
    [ChainId.EthereumMainnet]: constants.StarknetChainId.MAINNET,
    [ChainId.EthereumGoerli]: constants.StarknetChainId.TESTNET,
  };

  /**
   * The EVM provider that was provided via the config
   */
  public get provider() {
    if (this._evm instanceof Wallet) {
      return this._evm.provider as JsonRpcProvider;
    }
    return this._evm;
  }

  /**
   * The EVM signer that was provided via the config
   */
  public get signer() {
    if (Wallet.isSigner(this._evm)) {
      return this._evm;
    }
    if (this._evm instanceof Web3Provider) {
      return this._evm.getSigner();
    }
    throw new Error('EVM signer not available');
  }

  /**
   * @param config The chain configuration
   */
  // prettier-ignore
  constructor(config: ChainConfig) {
    this._evmChainId = config.evmChainId;
    this._addresses = getContractAddressesForChainOrThrow(config.evmChainId);
    this._evm = typeof config.evm === 'string' ? new JsonRpcProvider(config.evm) : config.evm;
    this._starknet = config.starknet instanceof SequencerProvider ? config.starknet : new SequencerProvider(config.starknet ?? {
      network: ChainBase.EVM_TO_STARKNET_CHAIN_ID[config.evmChainId],
    });
  }
}
