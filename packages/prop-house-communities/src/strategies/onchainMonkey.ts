import { Provider } from '@ethersproject/providers';
import { Strategy } from '../types/Strategy';
import BalanceOfABI from '../abi/BalanceOfABI.json';
import { Contract } from 'ethers';
import { parseBlockTag } from '../utils/parseBlockTag';

/**
 * Custom voting strategy for the OCM community
 */
export const onchainMonkey = (): Strategy => {
  return async (
    userAddress: string,
    communityAddress: string,
    blockTag: number,
    provider: Provider,
  ) => {
    const contracts = [
      '0x86cc280d0bac0bd4ea38ba7d31e895aa20cceb4b', // karma
      '0x960b7a6bcd451c9968473f7bbfd9be826efd549a', // ocm
    ].map(address => new Contract(address, BalanceOfABI, provider));

    const balances = await Promise.all(
      contracts.map(contract =>
        contract.balanceOf(userAddress, {
          blockTag: parseBlockTag(blockTag),
        }),
      ),
    );

    const [karma, ocm] = balances.map(bal => bal.toNumber());
    return karma + ocm + Math.min(karma, ocm);
  };
};
