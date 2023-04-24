import { House, Round } from '@prophouse/sdk-react';

/**
 * build url path to round (/:house-address/:round-address)
 */
export const buildRoundPath = (house: House, round: Round) =>
  `/${house.address}/${round.address}`;
