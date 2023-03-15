import { StoredInfiniteAuction, StoredProposal } from '@nouns/prop-house-wrapper/dist/builders';
import dayjs from 'dayjs';

export const isActiveProp = (prop: StoredProposal, round: StoredInfiniteAuction) =>
  dayjs(prop.createdDate).add(round.votingPeriod, 'seconds').isAfter(dayjs());
