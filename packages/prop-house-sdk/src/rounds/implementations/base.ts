import { ChainId } from '@prophouse/protocol';
import { Interface } from '@ethersproject/abi';
import { QueryWrapper } from '../../gql';
import {
  Custom,
  GetRoundStateParams,
  RoundChainConfig,
  RoundConfigs,
  RoundConfigStruct,
  RoundContract,
  RoundState,
  RoundType,
} from '../../types';
import { bytes, splitUint256 } from '../../utils';
import { ChainBase } from '../../chain-base';
import { GovPowerManager } from '../../gov-power';
import randomBytes from 'randombytes';

export abstract class RoundBase<
  RT extends RoundType,
  CS extends void | Custom = void,
> extends ChainBase {
  protected readonly _govPower: GovPowerManager<CS>;
  protected readonly _query: QueryWrapper;
  protected readonly _relayer: string;

  // prettier-ignore
  constructor(config: RoundChainConfig<CS>) {
    super(config);
    this._govPower = config.govPower ?? GovPowerManager.for<CS>(config);
    this._query = config.query ?? QueryWrapper.for(config.evmChainId);
    this._relayer = config.customStarknetRelayer || RoundBase.DEFAULT_STARKNET_RELAYERS[this._evmChainId];
  }

  /**
   * EIP712 domain
   */
  public readonly DOMAIN = {
    name: 'prop-house',
    version: '1',
    // TODO: Replace with `this._evmChainId.toString()` once using a
    // deployment-time-constant on the Starknet side.
    chainId: ChainId.EthereumGoerli.toString(),
  };


  /**
   * Shared EIP712 types
   */
  public static EIP_712_TYPES = {
    UserStrategy: [
      { name: 'id', type: 'uint256' },
      { name: 'userParams', type: 'uint256[]' },
    ],
    Asset: [
      { name: 'assetId', type: 'uint256' },
      { name: 'amount', type: 'uint256' },
    ],
  };

  /**
   * Default Starknet relayers
   */
  public static readonly DEFAULT_STARKNET_RELAYERS: Record<number, string> = {
    [ChainId.EthereumGoerli]: 'https://starknet-relayer.onrender.com',
  };

  /**
   * Internal helper that returns the current timestamp in seconds
   */
  protected static get _TIMESTAMP_SECS() {
    return Math.floor(Date.now() / 1000);
  }

  /**
   * The Starknet relayer URL
   */
  public get relayer() {
    return this._relayer;
  }

  /**
   * The Starknet relayer path
   */
  public abstract get relayerPath(): string;

  /**
   * The round type
   */
  public abstract get type(): RT;

  /**
   * The round implementation contract address
   */
  public abstract get impl(): string;

  /**
   * The round implementation contract interface
   */
  public abstract get interface(): Interface;

  /**
   * Convert the provided round configuration to a config struct
   * @param config The round configuration
   */
  public abstract getConfigStruct(config: RoundConfigs<CS>[RT]): Promise<RoundConfigStruct[RT]>;

  /**
   * Estimate the round registration message fee cost (in wei)
   * @param configStruct The round configuration struct
   */
  public abstract estimateMessageFee(configStruct: RoundConfigStruct[RT]): Promise<string>;

  /**
   * ABI-encode the provided round configuration struct
   * @param configStruct The round configuration struct
   */
  public abstract encode(configStruct: RoundConfigStruct[RT]): string;

  /**
   * Given a round address, return a round contract instance
   * @param address The round contract address
   */
  public abstract getContract(address: string): RoundContract[RT];

  /**
   * Given the provided params, return the round state
   * @param _params The information required to get the round state
   */
  public static getState(_params: GetRoundStateParams): RoundState {
    throw new Error('Not implemented');
  }

  /**
   * Send a payload to the Starknet relayer
   * @param params The JSON RPC params
   */
  public async sendToRelayer<T>(params: T) {
    const res = await fetch(`${this.relayer}/${this.relayerPath}`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'send',
        params,
        id: null,
      }),
    });
    const json = await res.json();
    return json.result;
  }

  /**
   * Generate the salt that's included in the signed message
   */
  protected generateSalt() {
    return Number(splitUint256.SplitUint256.fromHex(bytes.bytesToHex(randomBytes(4))).toHex());
  }

  /**
   * Pick the provided keys from the provided object
   * @param object The object to pick from
   * @param keys The keys to pick
   */
  protected pick<T, K extends keyof T>(object: T, keys: K[]): Pick<T, K> {
    return Object.assign(
      {},
      ...keys.map(key => {
        if (object && Object.prototype.hasOwnProperty.call(object, key)) {
          return { [key]: object[key] };
        }
      })
    );
  }
}
