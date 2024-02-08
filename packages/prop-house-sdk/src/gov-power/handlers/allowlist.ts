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
    const { sortedValues, sortedMembers } = this.getTreeValues(strategy.members);
    const root = new merkle.MerklePedersen(sortedValues).root;

    const { IpfsHash } = await this._pinata.pinJSONToIPFS({
      strategyType: GovPowerStrategyType.ALLOWLIST,
      members: sortedMembers,
      tree: {
        root,
        values: sortedValues,
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
  public async getUserParams(account: string, _timestamp: string, strategyId: string): Promise<string[]> {
    const strategy = await this.getStrategyAddressAndParams(strategyId);
    const cid = encoding.stringFromLE(strategy.params.slice(1));

    const allowlist: AllowlistJson = await ipfs.getJSON(cid);

    // Quick Fix: Members were not being sorted alongside the tree values.
    const { sortedMembers, sortedValues } = this.getTreeValues(allowlist.members);;
    const memberIndex = sortedMembers.findIndex(member => 
      member.address.toLowerCase() === account.toLowerCase(),
    );
    if (!~memberIndex) {
      throw new Error(`Account ${account} is not on the allowlist`);
    }
    const member = sortedMembers[memberIndex];
    const { low, high } = splitUint256.SplitUint256.fromUint(BigInt(member.govPower));
    return [member.address, low, high, ...merkle.MerklePedersen.getProof(sortedValues, memberIndex)];
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
    const sortedValues = members.map(member => {
      const { low, high } = splitUint256.SplitUint256.fromUint(BigInt(member.govPower));
      return {
        member,
        value: hash.computeHashOnElements([member.address, low, high]),
      }
    })
    .sort((a, b) => {
      if (a.value > b.value) return 1;
      if (a.value < b.value) return -1;
      return 0;
    });
    return {
      sortedMembers: sortedValues.map(({ member }) => member),
      sortedValues: sortedValues.map(({ value }) => value),
    };
  }
}
