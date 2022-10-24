import { Community } from './community.entity';

export interface ComputedCommunityAttributes {
  numProposals: number;
  ethFunded: number;
}

export type CommunityOverview = Partial<Community>;

export type ExtendedCommunity = ComputedCommunityAttributes & Community;
