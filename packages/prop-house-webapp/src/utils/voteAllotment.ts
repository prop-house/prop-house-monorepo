export interface VoteAllotment {
  proposalId: number;
  votes: number;
}

export const updateVoteAllotment = (
  v: VoteAllotment,
  support: boolean
): VoteAllotment => ({
  proposalId: v.proposalId,
  votes: support ? v.votes + 1 : v.votes === 0 ? 0 : v.votes - 1,
});

export const votesForProp = (
  voteAllotments: VoteAllotment[],
  proposalId: number
) => {
  const a = voteAllotments.find((a) => a.proposalId === proposalId);
  return a ? a.votes : 0;
};
