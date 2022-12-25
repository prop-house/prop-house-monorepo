import { Vote } from '../builders';

/**
 * Payload to match `VoteMessageTypes` (EIP712)
 */
export const multiVotePayload = (votes: Vote[]) => {
  return {
    votes: votes.map(v => {
      return { ...v.toPayload() };
    }),
  };
};
