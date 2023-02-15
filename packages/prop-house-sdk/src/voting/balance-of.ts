import { JsonRpcProvider } from '@ethersproject/providers';
import {
  BalanceOf,
  BalanceOfWithTokenID,
  VotingStrategyStruct,
  VotingStrategyType,
} from '../types';
import { ChainId, getContractAddressesForChainOrThrow } from '../addresses';
import { VotingStrategy } from './base';
import { storageProofs } from '../utils';
import { BigNumber } from '@ethersproject/bignumber';

export class BalanceOfVotingStrategy extends VotingStrategy<BalanceOf | BalanceOfWithTokenID> {
  // prettier-ignore
  private readonly _rpcs: Record<number, string> = {
    [ChainId.EthereumGoerli]: 'https://goerli.blockpi.network/v1/rpc/756ed7f20b1fcbed679bc9384c021a69ffd59cfc',
    [ChainId.EthereumMainnet]: 'https://ethereum.blockpi.network/v1/rpc/515fa4f00418c429db4f81cda04b628e7ecc7191',
  };
  private readonly _provider: JsonRpcProvider;

  /**
   * Returns a `BalanceOfVotingStrategy` instance for the provided chain ID
   * @param chainId The chain ID
   */
  public static for(chainId: number) {
    return new BalanceOfVotingStrategy(chainId);
  }

  /**
   * The voting strategy type
   */
  public get type() {
    return VotingStrategyType.BALANCE_OF;
  }

  constructor(chainId: number) {
    super(chainId);

    if (!this._rpcs[chainId]) {
      throw new Error(`No trace provider available for chain with ID: ${chainId}`);
    }
    this._provider = new JsonRpcProvider(this._rpcs[chainId]);
  }

  /**
   * @notice Convert the provided `balanceOf` voting strategy to a low-level voting strategy struct
   * @param strategy The voting strategy information
   */
  public async getStructConfig(
    strategy: BalanceOf | BalanceOfWithTokenID,
  ): Promise<VotingStrategyStruct> {
    const { starknet } = getContractAddressesForChainOrThrow(this._chainId);

    if (this.hasTokenID(strategy)) {
      throw new Error(`The \`balanceOf\` voting strategy does not yet support token IDs`);
    }
    const { slotIndex } = await storageProofs.getBalanceOfEVMStorageSlotIndex(
      this._provider,
      strategy.address,
    );
    if (strategy.multiplier && BigNumber.from(strategy.multiplier).gt(0)) {
      return {
        addr: starknet.voting.balanceOfMultiplier,
        params: [strategy.address, slotIndex, strategy.multiplier],
      };
    }
    return {
      addr: starknet.voting.balanceOf,
      params: [strategy.address, slotIndex],
    };
  }

  /**
   * Determine if the provided `balanceOf` voting strategy takes a token ID
   * @param strategy The voting strategy information
   */
  private hasTokenID(strategy: BalanceOf | BalanceOfWithTokenID): strategy is BalanceOfWithTokenID {
    if ((strategy as BalanceOfWithTokenID).tokenId !== undefined) {
      return true;
    }
    return false;
  }
}
