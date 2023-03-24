import { StoredInfiniteAuction, StoredProposal } from '@nouns/prop-house-wrapper/dist/builders';
import dayjs from 'dayjs';

/**
 * Checks whether or not an infinite round proposal is active: created within voting period and has not met quorum.
 */
export const isActiveProp = (prop: StoredProposal, round: StoredInfiniteAuction) =>
  dayjs(prop.createdDate).add(round.votingPeriod, 'seconds').isAfter(dayjs()) &&
  prop.voteCount < round.quorum;
