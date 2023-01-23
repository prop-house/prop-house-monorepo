import { VoteAllotment } from '../types/VoteAllotment';

/**
 * Sort vote allotments by votes
 * @param voteAllotments a user's vote allotments
 * @returns sorted allotment array
 */
const sortVoteAllotmentsByVotes = (voteAllotments: VoteAllotment[]) =>
  voteAllotments.slice().sort((a, b) => (a.votes < b.votes ? 1 : -1));

export default sortVoteAllotmentsByVotes;
