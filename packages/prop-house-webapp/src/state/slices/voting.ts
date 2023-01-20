import { Direction } from '@nouns/prop-house-wrapper/dist/builders';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { VoteAllotment } from '../../types/VoteAllotment';

export interface VotingSlice {
  // votes user is alloting to potentially vote
  voteAllotments: VoteAllotment[];
  // number of votes user can cast
  votingPower: number;
  // votes already submitted by user
  numSubmittedVotes: number;
}

const initialState: VotingSlice = {
  voteAllotments: [],
  votingPower: 0,
  numSubmittedVotes: 0,
};

export const updateVoteAllotment = (
  v: VoteAllotment,
  direction: Direction,
  weight: number,
): VoteAllotment => ({
  proposalTitle: v.proposalTitle,
  proposalId: v.proposalId,
  votes: direction === Direction.Up ? v.votes + weight : v.votes - weight,
});

export const votingSlice = createSlice({
  name: 'voting',
  initialState,
  reducers: {
    setVoteAllotments: (state, action: PayloadAction<VoteAllotment[]>) => {
      state.voteAllotments = action.payload;
    },
    setVotingPower: (state, action: PayloadAction<number>) => {
      state.votingPower = action.payload;
    },
    setNumSubmittedVotes: (state, action: PayloadAction<number>) => {
      state.numSubmittedVotes = action.payload;
    },
    allotVotes: (
      state,
      action: PayloadAction<{
        proposalTitle: string;
        proposalId: number;
        direction: Direction;
        weight: number;
      }>,
    ) => {
      const { proposalTitle, proposalId, direction, weight } = action.payload;

      // if no votes have been allotted yet, add new
      if (state.voteAllotments.length === 0) {
        state.voteAllotments = [
          { proposalTitle: proposalTitle, proposalId: proposalId, votes: weight },
        ];
        return;
      }

      const preexistingVoteAllotment = state.voteAllotments.find(
        allotment => allotment.proposalId === proposalId,
      );

      // if not already alloted to specific proposal,  add new allotment
      if (!preexistingVoteAllotment) {
        state.voteAllotments = [
          ...state.voteAllotments,
          { proposalTitle, proposalId, votes: weight },
        ];
        return;
      }

      // if already allotted to a specific proposal, add one vote to allotment
      const updated = state.voteAllotments
        .map(a =>
          a.proposalId === preexistingVoteAllotment.proposalId
            ? updateVoteAllotment(a, direction, weight)
            : a,
        )
        .filter(allotment => allotment.votes > 0);

      state.voteAllotments = updated;
    },
    clearVoteAllotments: state => {
      state.voteAllotments = [];
    },
  },
});

// Action creators are generated for each case reducer function
export const {
  setVoteAllotments,
  setVotingPower,
  setNumSubmittedVotes,
  allotVotes,
  clearVoteAllotments,
} = votingSlice.actions;

export default votingSlice.reducer;
