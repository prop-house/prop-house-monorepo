import { getContractAddressesForChainOrThrow } from '../addresses';
import { Vanilla, VotingStrategyStruct, VotingStrategyType } from '../types';
import { VotingStrategy } from './base';

export class VanillaVotingStrategy extends VotingStrategy<Vanilla> {
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
   * @notice Convert the provided voting strategy to a low-level voting strategy struct
   * @param strategy The voting strategy information
   */
  public async getStructConfig(): Promise<VotingStrategyStruct> {
    const { starknet } = getContractAddressesForChainOrThrow(this._chainId);
    return {
      addr: starknet.voting.vanilla,
      params: [],
    };
  }
}
