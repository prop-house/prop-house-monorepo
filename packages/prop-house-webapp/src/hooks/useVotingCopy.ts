import { RoundVotingStrategy } from '@prophouse/sdk-react';

/**
 * Determines the voting copy using `RoundVotingStrategy[]`
 * @param votingStrategies
 * @returns copy describing the strategies
 */
const useVotingCopy = (votingStrategies: RoundVotingStrategy[]) => {
  // current supported strats = whitelist / balance of

  // if white list,
  // if one: "account with address 0x00 is eligible to vote"
  // if multiple "these accounts are eligible to vote"

  // if balanceof,
  // if one, owners of the xx token are eligible to vote
  // if multiple "owners of one of the voting tokens are eligible to vote"

  return 'voting copy here';
};

export default useVotingCopy;