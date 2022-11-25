import { VoteAllotment } from '../types/VoteAllotment';

/**
 * Clean up the vote allotments for display by removing those with explicitly 0 votes as well as sort by votes
 * @param voteAllotments a user's vote allotments
 * @returns cleaned & sorted allotment array
 */
const removeZeroVotesAndSortByVotes = (voteAllotments: VoteAllotment[]) => {
  return (
    voteAllotments
      // remove props with zero votes
      .filter(p => p.votes !== 0)
      // sort by most to least votes
      .sort((a, b) => (a.votes < b.votes ? 1 : -1))
  );
};

export default removeZeroVotesAndSortByVotes;
