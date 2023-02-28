import { uuid } from 'uuidv4';
import { AwardProps } from '../AwardsSelector';

/**
 * Change properties of awards by ID
 * @param id ID of award to update
 * @param awards Array of awards
 * @param changes Object with properties to change
 * @returns Updated array of awards
 */
export const changeAward = (id: string, awards: AwardProps[], changes: Partial<AwardProps>) =>
  awards.map(award => (award.id === id ? { ...award, ...changes } : award));
