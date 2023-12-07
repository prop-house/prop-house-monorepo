import { StoredProposalWithVotes, InfiniteAuction } from '@nouns/prop-house-wrapper/dist/builders';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { sortTimedRoundProps } from '../../utils/sortTimedRoundProps';
import { House, Round } from '@prophouse/sdk-react';
import { ProposalWithTldr } from '../../types/ProposalWithTldr';

export interface PropHouseSlice {
  activeProposal?: ProposalWithTldr;
  activeProposals?: ProposalWithTldr[];
  activeRound?: Round;
  activeHouse?: House;

  modalActive: boolean;
  infRoundFilteredProposals?: StoredProposalWithVotes[];
  infRoundFilterType: InfRoundFilterType;
}

export interface TimedRoundSortProps {
  sortType: TimedRoundSortType;
  ascending: boolean;
}

export enum TimedRoundSortType {
  VoteCount,
  CreatedAt,
  Random,
}

export enum InfRoundFilterType {
  Active,
  Winners,
  Rejected,
  Stale,
}

const initialState: PropHouseSlice = {
  modalActive: false,
  infRoundFilterType: InfRoundFilterType.Active,
};

export const propHouseSlice = createSlice({
  name: 'propHouse',
  initialState,
  reducers: {
    setOnchainActiveRound: (state, action: PayloadAction<Round | undefined>) => {
      state.activeRound = action.payload;
    },
    setOnchainActiveProposal: (state, action: PayloadAction<ProposalWithTldr | undefined>) => {
      state.activeProposal = action.payload;
    },

    setOnChainActiveProposals: (state, action: PayloadAction<ProposalWithTldr[] | undefined>) => {
      state.activeProposals =
        action.payload === undefined
          ? undefined
          : action.payload.sort((a, b) => Number(b.votingPower) - Number(a.votingPower));
    },
    appendProposal: (state, action: PayloadAction<{ proposal: ProposalWithTldr }>) => {
      state.activeProposals?.push(action.payload.proposal);
    },
    sortTimedRoundProposals: (state, action: PayloadAction<TimedRoundSortProps>) => {
      if (!state.activeProposals) return;
      state.activeProposals = sortTimedRoundProps(state.activeProposals, action.payload);
    },
    filterInfRoundProposals: (
      state,
      action: PayloadAction<{ type: InfRoundFilterType; round: InfiniteAuction }>,
    ) => {
      // todo: fix once sdk support is available
      // if (!state.onchainActiveProposals) return;
      // state.infRoundFilteredProposals = filterInfRoundProps(
      //   state.onchainActiveProposals,
      //   action.payload.type,
      //   action.payload.round,
      // );
    },
    setInfRoundFilterType: (state, action: PayloadAction<InfRoundFilterType>) => {
      state.infRoundFilterType = action.payload;
    },
    setOnchainActiveHouse: (state, action: PayloadAction<House | undefined>) => {
      state.activeHouse = action.payload;
    },
    setModalActive: (state, action: PayloadAction<boolean>) => {
      state.modalActive = action.payload;
    },
  },
});

// Action creators are generated for each case reducer function
export const {
  setOnchainActiveProposal,
  setOnChainActiveProposals,
  setOnchainActiveRound,
  setOnchainActiveHouse,

  appendProposal,
  sortTimedRoundProposals,
  filterInfRoundProposals,
  setModalActive,
  setInfRoundFilterType,
} = propHouseSlice.actions;

export default propHouseSlice.reducer;
