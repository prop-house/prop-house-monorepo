import { Proposal, Round } from '@prophouse/sdk-react';
import dayjs from 'dayjs';

/**
 * Checks whether or not an infinite round proposal is active: created within voting period and has not met quorum.
 */
export const isActiveProp = (prop: Proposal, round: Round) => false;
  // Not implemented
  // dayjs(prop.createdDate).add(round.votingPeriod, 'seconds').isAfter(dayjs()) &&
  // prop.voteCount < round.quorum;
