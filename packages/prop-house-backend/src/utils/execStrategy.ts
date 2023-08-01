import config from 'src/config/configuration';
import { Auction } from 'src/auction/auction.entity';
import { InfiniteAuction } from 'src/infinite-auction/infinite-auction.entity';
import { ethers } from 'ethers';
import { execStrategy } from '@prophouse/communities';
import { Address } from 'src/types/address';

export const _execStrategy = async (
  account: Address,
  round: Pick<Auction | InfiniteAuction, 'voteStrategy'>,
): Promise<number> => {
  /** Hard coded values should be updated to be dynamic */
  const chainId = round.voteStrategy.chainId;
  const baseRPC = 'https://developer-access-mainnet.base.org';
  const mainnetRPC = config().JSONRPC;

  const provider = new ethers.providers.JsonRpcProvider(
    chainId === 8453 ? baseRPC : mainnetRPC,
  );

  const strategyPayload = {
    strategyName: round.voteStrategy.strategyName,
    account,
    provider,
    ...round.voteStrategy,
  };
  const votingPower = await execStrategy(strategyPayload);
  return votingPower;
};
