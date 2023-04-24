import { House, Round } from '@prophouse/sdk-react';

/**
 * build url path to proposal (/:house-address/:round-address/:proposal-id)
 */
export const buildProposalPath = (house: House, round: Round, propId: number) =>
  `https://prop.house/${house.address}/${round.address}/${propId}`;
