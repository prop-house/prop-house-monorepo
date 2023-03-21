import { StoredInfiniteAuction, StoredProposal } from '@nouns/prop-house-wrapper/dist/builders';
import dayjs from 'dayjs';

/**
 * Checks whether or not an infinite round proposal is active (creating within voting period)
 */
export const isActiveProp = (prop: StoredProposal, round: StoredInfiniteAuction) =>
  dayjs(prop.createdDate).add(round.votingPeriod, 'seconds').isAfter(dayjs());
