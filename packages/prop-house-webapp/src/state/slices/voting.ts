import { Direction } from '@nouns/prop-house-wrapper/dist/builders';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { VoteAllotment } from '../../types/VoteAllotment';
import { Vote } from '@prophouse/sdk-react';

export interface VotingSlice {
  // votes user is alloting to potentially vote
  voteAllotments: VoteAllotment[];
  // number of votes user can cast
  votingPower: number;
  // votes already submitted by user
  votesByUserInActiveRound: Vote[];
}

const initialState: VotingSlice = {
  voteAllotments: [],
  votingPower: 0,
  votesByUserInActiveRound: [],
};

export const updateVoteAllotment = (
  oldAllotment: VoteAllotment,
  newAllotment: VoteAllotment,
): VoteAllotment => {
  const { updatedWeight, updatedDirection } = calcNewWeightAndDirection(oldAllotment, newAllotment);
  return {
    ...newAllotment,
    votes: updatedWeight,
    direction: updatedDirection,
  };
};

const calcNewWeightAndDirection = (
  oldAllotment: VoteAllotment,
  newAllotment: VoteAllotment,
): { updatedWeight: number; updatedDirection: Direction } => {
  const oldWeight = oldAllotment.votes;
  const newWeight = newAllotment.votes;

  const oldDirection = oldAllotment.direction;
  const newDirection = newAllotment.direction;
  const sameDirection = oldDirection === newDirection;
  const adding = oldDirection === Direction.Down && newDirection === Direction.Up;

  if (sameDirection)
    return { updatedWeight: oldWeight + newWeight, updatedDirection: oldDirection };

  // adding: -x + y else: x - y
  const updatedWeight = adding ? oldWeight * -1 + newWeight : oldWeight - newWeight;
  return updatedWeight < 0
    ? { updatedWeight: updatedWeight * -1, updatedDirection: Direction.Down }
    : { updatedWeight, updatedDirection: Direction.Up };
};

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
    setVotesByUserInActiveRound: (state, action: PayloadAction<Vote[]>) => {
      state.votesByUserInActiveRound = action.payload;
    },
    allotVotes: (
      state,
      action: PayloadAction<{
        voteAllotment: VoteAllotment;
      }>,
    ) => {
      const { voteAllotment } = action.payload;

      // if no votes have been allotted yet, add new
      if (state.voteAllotments.length === 0) {
        state.voteAllotments = [voteAllotment];
        return;
      }

      const preexistingVoteAllotment = state.voteAllotments.find(
        allotment => allotment.proposalId === voteAllotment.proposalId,
      );

      // if not already alloted to specific proposal,  add new allotment
      if (!preexistingVoteAllotment) {
        state.voteAllotments = [...state.voteAllotments, voteAllotment];
        return;
      }

      // if already allotted to a specific proposal, add one vote to allotment
      const updated = state.voteAllotments
        .map(a =>
          a.proposalId === preexistingVoteAllotment.proposalId
            ? updateVoteAllotment(a, voteAllotment)
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
  setVotesByUserInActiveRound,
  allotVotes,
  clearVoteAllotments,
} = votingSlice.actions;

export default votingSlice.reducer;
