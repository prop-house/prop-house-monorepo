import { PropHouseStrategyType, SnapshotStrategy } from '../types';
import { ethers } from 'ethers';
import { erc20Base } from './erc20Base';
import { erc721Base } from './erc721Base';

/**
 * Parses strategy params into valid `SnapshotStrategy`. Throws if invalid.
 */
export const parseStrategy = (
  strategy: PropHouseStrategyType,
  contractAddress?: string,
  customStrategy?: SnapshotStrategy,
): SnapshotStrategy => {
  if (strategy === PropHouseStrategyType.Custom) {
    const parsedStrategy = JSON.parse(String(customStrategy));
    if (!customStrategy || !parsedStrategy.name || !parsedStrategy.params)
      throw Error('Custom strategy is invalid.');
    return parsedStrategy;
  }

  if (!contractAddress) throw Error('Round contract address is undefined.');
  if (!ethers.utils.isAddress(contractAddress)) throw Error('Round does not have a valid address.');

  return strategy === PropHouseStrategyType.ERC20
    ? erc20Base(contractAddress)
    : erc721Base(contractAddress);
};
