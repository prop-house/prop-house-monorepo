import { Auction } from 'src/auction/auction.entity';
import { Community } from './community.entity';
import { ExtendedCommunity } from './community.types';

export const buildExtendedCommunity = (
  community: Community,
): ExtendedCommunity =>
  community.auctions.reduce(
    (acc: ExtendedCommunity, auction: Auction) => {
      acc.numProposals += auction.proposals.length;
      acc.ethFunded += auction.fundingAmount * auction.numWinners;
      return acc;
    },
    {
      ...community,
      numProposals: 0,
      ethFunded: 0,
    } as ExtendedCommunity,
  );
