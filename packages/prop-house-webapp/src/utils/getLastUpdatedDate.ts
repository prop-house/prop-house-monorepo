import { Proposal } from '@prophouse/sdk-react';

/**
 * If a prop has been edited, the last updated date will be used to compare versus created date.
 * @param proposal Proposal
 * @returns a timedstamp
 */
// todo: update when SDK provides updatedDate data
export const getLastUpdatedDate = (proposal: Proposal) => proposal.receivedAt;
