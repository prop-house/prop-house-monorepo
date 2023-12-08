import { hash } from 'starknet';
import { ChainConfig, GovPowerStrategyType, AllowlistConfig, AllowlistMember, GovPowerConfig, AllowlistJson } from '../../types';
import { BigNumber } from '@ethersproject/bignumber';
import { encoding, intsSequence, ipfs, merkle, splitUint256 } from '../../utils';
import { StrategyHandlerBase } from './base';
import { PINATA_JWT } from '../../constants';
import Pinata from '@pinata/sdk';

export class AllowlistHandler extends StrategyHandlerBase<AllowlistConfig> {
  private readonly _pinata: Pinata;

  /**
   * @param config The chain configuration
   */
  constructor(config: ChainConfig) {
    super(config);
    this._pinata = new Pinata({
      pinataJWTKey: PINATA_JWT,
    });
  }

  /**
   * Returns a `AllowlistHandler` instance for the provided chain configuration
   * @param config The chain config
   */
  public static for(config: ChainConfig) {
    return new AllowlistHandler(config);
  }

  /**
   * The governance power strategy type
   */
  public get type() {
    return GovPowerStrategyType.ALLOWLIST;
  }

  /**
   * The governance power strategy address
   */
  public get address() {
    return this._addresses.starknet.govPower.allowlist;
  }

  /**
   * @notice Get the governance power strategy params that will be shared amongst all users
   * @param strategy The  governance power strategy information
   */
  public async getStrategyParams(strategy: AllowlistConfig): Promise<string[]> {
    if (!strategy.members?.length) {
      throw new Error('No allowlist members provided');
    }
    const values = this.getTreeValues(strategy.members);
    const root = new merkle.MerklePedersen(values).root;

    const { IpfsHash } = await this._pinata.pinJSONToIPFS({
      strategyType: GovPowerStrategyType.ALLOWLIST,
      members: strategy.members,
      tree: {
        root,
        values,
      },
    });
    const formattedIPFS = intsSequence.IntsSequence.LEFromString(
      IpfsHash,
    );
    return [root, ...formattedIPFS.values];
  }

  /**
   * @notice Get the user governance power strategy params
   * For the merkle allowlist strategy, this is the address, governance power, and proof.
   */
  public async getUserParams(account: string, timestamp: string, strategyId: string): Promise<string[]> {
    const strategy = await this.getStrategyAddressAndParams(strategyId);
    const cid = encoding.stringFromLE(strategy.params.slice(1));

    const allowlist: AllowlistJson = await ipfs.getJSON(cid);
    const memberIndex = allowlist.members.findIndex(member => 
      member.address.toLowerCase() === account.toLowerCase(),
    );
    if (!~memberIndex) {
      throw new Error(`Account ${account} is not on the allowlist`);
    }
    const member = allowlist.members[memberIndex];
    const { low, high } = splitUint256.SplitUint256.fromUint(BigInt(member.govPower));
    return [member.address, low, high, ...merkle.MerklePedersen.getProof(allowlist.tree.values, memberIndex)];
  }

  /**
   * @notice Get the governance power for the provided user, obtained from the allowlist
   */
  public async getPower(config: GovPowerConfig): Promise<BigNumber> {
    const cid = encoding.stringFromLE(config.params.slice(1).map(param => param.toString()));
    const allowlist: AllowlistJson = await ipfs.getJSON(cid);
    const member = allowlist.members.find(member => 
      member.address.toLowerCase() === config.user.toLowerCase(),
    );
    if (!member) {
      return BigNumber.from(0);
    }
    return BigNumber.from(member.govPower);
  }

  /**
   * Hash the addresses and governance power values to be used in the merkle tree
   * @param members The allowlist addresses and governance power
   */
  private getTreeValues(members: AllowlistMember[]) {
    return members
      .map(member => {
        const { low, high } = splitUint256.SplitUint256.fromUint(BigInt(member.govPower));
        return hash.computeHashOnElements([member.address, low, high]);
      })
      .sort((a, b) => {
        if (a > b) return 1;
        if (a < b) return -1;
        return 0;
      });
  }
}
