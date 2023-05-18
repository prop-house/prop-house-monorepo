import { VotingStrategyConfig } from '@prophouse/sdk-react';

/**
 * This will check if the voter list has changed. Meaning the two arrays are not the same length or not every element is the same.
 * @param originalVoters Original voter list to compare
 * @param editedVoters Edited voter list to compare
 */

export const hasVoterListChanged = (
  originalVoters: VotingStrategyConfig[],
  editedVoters: VotingStrategyConfig[],
) => {
  return (
    originalVoters.length !== editedVoters.length ||
    !originalVoters.every((value, index) => value === editedVoters[index])
  );
};
