import {
  ChainId,
  ContractAddresses,
  getContractAddressesForChainOrThrow,
} from '@prophouse/protocol';
import { RpcProvider as StarknetRpcProvider } from 'starknet';
import { JsonRpcProvider, JsonRpcSigner, Web3Provider } from '@ethersproject/providers';
import { Signer, TypedDataSigner } from '@ethersproject/abstract-signer';
import { Provider } from '@ethersproject/abstract-provider';
import { Wallet } from '@ethersproject/wallet';
import { ChainConfig, EVM } from './types';

export class ChainBase {
  protected readonly _evmChainId: number;
  protected readonly _addresses: ContractAddresses;
  protected readonly _starknet: StarknetRpcProvider;
  protected _evm: Signer | Provider;

  /**
   * EVM to Starknet chain ID mappings
   */
  public static readonly EVM_TO_DEFAULT_STARKNET_RPC: Record<number, string> = {
    [ChainId.EthereumMainnet]: 'https://starknet-mainnet.infura.io/v3/7ec322178a4849f0888bae9b59401b39',
    [ChainId.EthereumGoerli]: 'https://starknet-goerli.infura.io/v3/7ec322178a4849f0888bae9b59401b39',
  };

  /**
   * The EVM provider that was provided via the config
   */
  public get provider() {
    if ((this._evm as JsonRpcSigner).provider) {
      return (this._evm as JsonRpcSigner).provider;
    }
    return this._evm as JsonRpcProvider;
  }

  /**
   * The EVM signer that was provided via the config
   */
  public get signer() {
    if (Wallet.isSigner(this._evm)) {
      // Make the assumption that the signer has support for
      // typed data signing to reduce the need for consumers
      // of this class to have to cast.
      return this._evm as unknown as Signer & TypedDataSigner;
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
    this._evm = this.toEVMSignerOrProvider(config.evm);
    this._starknet = config.starknet instanceof StarknetRpcProvider ? config.starknet : new StarknetRpcProvider(config.starknet ?? {
      nodeUrl: ChainBase.EVM_TO_DEFAULT_STARKNET_RPC[config.evmChainId],
    });
  }

  /**
   * Convert the provided EVM config value to a signer or provider
   * @param evm The provided evm config value
   */
  protected toEVMSignerOrProvider(evm: EVM) {
    return typeof evm === 'string' ? new JsonRpcProvider(evm) : evm;
  }
}
