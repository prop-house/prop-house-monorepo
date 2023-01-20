import { VoteAllotment } from '../types/VoteAllotment';

/**
 * Clean up the vote allotments for display by removing those with explicitly 0 votes
 * @param voteAllotments a user's vote allotments
 * @returns cleaned up allotment array
 */
const removePropsWithZeroVotes = (voteAllotments: VoteAllotment[]) => {
  return (
    voteAllotments
      // remove props with zero votes
      .filter(p => p.votes !== 0)
  );
};

export default removePropsWithZeroVotes;
