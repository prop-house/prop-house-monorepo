import { getContractAddressesForChainOrThrow } from '../addresses';
import { Vanilla, StarknetVotingStrategy, VotingStrategyType } from '../types';
import { VotingStrategyBase } from './base';

export class VanillaVotingStrategy extends VotingStrategyBase<Vanilla> {
  /**
   * Returns a `VanillaVotingStrategy` instance for the provided chain ID
   * @param chainId The chain ID
   */
  public static for(chainId: number) {
    return new VanillaVotingStrategy(chainId);
  }

  /**
   * The voting strategy type
   */
  public get type() {
    return VotingStrategyType.VANILLA;
  }

  /**
   * @notice Get the address and low-level parameter information for the vanilla voting strategy
   * @param strategy The voting strategy information
   */
  public async getStarknetStrategy(): Promise<StarknetVotingStrategy> {
    const { starknet } = getContractAddressesForChainOrThrow(this._chainId);
    return {
      addr: starknet.voting.vanilla,
      params: [],
    };
  }
}
