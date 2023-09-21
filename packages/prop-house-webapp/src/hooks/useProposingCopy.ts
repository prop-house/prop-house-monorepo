import { RoundVotingStrategy } from '@prophouse/sdk-react';

/**
 * Determines the proposing copy using `RoundVotingStrategy[]`
 * @param proposingStrategies
 * @returns copy describing the strategies
 */
const useProposingCopy = (proposingStrategies: RoundVotingStrategy[]) => {
  // current supported strats = whitelist / balance of

  // if white list,
  // if one: "account with address 0x00 is eligible to vote"
  // if multiple "these accounts are eligible to vote"

  // if balanceof,
  // if one, owners of the xx token are eligible to vote
  // if multiple "owners of one of the voting tokens are eligible to vote"

  return 'proposing copy here';
};

export default useProposingCopy;
