import { Round } from '@prophouse/sdk-react';

/**
 * build url path to proposal (/:roundAddress/:proposal-id)
 */
export const buildProposalPath = (round: Round, propId: number) =>
  `https://prop.house/${round.address}/${propId}`;
