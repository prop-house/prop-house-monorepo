import { ChainId } from '@prophouse/contracts';
import { QueryWrapper } from '../../gql';
import { Custom, RoundChainConfig, RoundConfig, RoundContract, RoundType } from '../../types';
import { bytes, splitUint256 } from '../../utils';
import { ChainBase } from '../../chain-base';
import { Voting } from '../../voting';
import randomBytes from 'randombytes';

export abstract class RoundBase<
  RT extends RoundType,
  CS extends void | Custom = void,
> extends ChainBase {
  protected readonly _voting: Voting<CS>;
  protected readonly _query: QueryWrapper;
  protected readonly _relayer: string;

  // prettier-ignore
  constructor(config: RoundChainConfig<CS>) {
    super(config);
    this._voting = config.voting ?? Voting.for<CS>(config);
    this._query = QueryWrapper.for(config.evmChainId);
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
   * Default Starknet relayers
   */
  public static readonly DEFAULT_STARKNET_RELAYERS: Record<number, string> = {
    [ChainId.EthereumGoerli]: 'https://starknet-relayer.onrender.com',
  };

  /**
   * The Starknet relayer URL
   */
  public get relayer() {
    return this._relayer;
  }

  /**
   * The round type
   */
  public abstract get type(): RT;

  /**
   * The round implementation contract address
   */
  public abstract get impl(): string;

  /**
   * ABI-encode the provided round configuration
   * @param config The round configuration
   */
  public abstract getABIEncodedConfig(config: RoundConfig<CS>[RT]): Promise<string>;

  /**
   * Given a round address, return a round contract instance
   * @param address The round contract address
   */
  public abstract getContract(address: string): RoundContract[RT];

  /**
   * Send a payload to the Starknet relayer
   * @param params The JSON RPC params
   */
  public async sendToRelayer<T>(params: T) {
    const res = await fetch(this.relayer, {
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
}
