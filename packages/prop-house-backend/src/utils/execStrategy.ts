import config from '../config/configuration';
import { Auction } from '../auction/auction.entity';
import { InfiniteAuction } from '../infinite-auction/infinite-auction.entity';
import { ethers } from 'ethers';
import { execStrategy } from '@prophouse/communities';
import { Address } from '../types/address';

export const _execStrategy = async (
  account: Address,
  round: Pick<Auction | InfiniteAuction, 'voteStrategy' | 'propStrategy'>,
  strategyType: 'voteStrategy' | 'propStrategy', // Additional parameter for strategy type
): Promise<number> => {
  /** Hard coded values should be updated to be dynamic */
  const chainId = round[strategyType].chainId;
  const baseRPC = 'https://developer-access-mainnet.base.org';
  const mainnetRPC = config().JSONRPC;

  const provider = new ethers.providers.JsonRpcProvider(
    chainId === 8453 ? baseRPC : mainnetRPC,
  );

  const strategyPayload = {
    strategyName: round[strategyType].strategyName,
    account,
    provider,
    ...round[strategyType],
  };
  const votingPower = await execStrategy(strategyPayload);
  return votingPower;
};
