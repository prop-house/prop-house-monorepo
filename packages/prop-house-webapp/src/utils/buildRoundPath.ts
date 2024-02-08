import { Round } from '@prophouse/sdk-react';

/**
 * build url path to round (/:roundAddress)
 */
export const buildRoundPath = (round: Round) => `/$${round.address}`;
