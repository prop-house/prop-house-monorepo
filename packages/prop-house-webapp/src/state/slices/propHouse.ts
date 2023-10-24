import {
  StoredProposalWithVotes,
  Community,
  StoredAuctionBase,
  InfiniteAuction,
} from '@nouns/prop-house-wrapper/dist/builders';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { sortTimedRoundProps } from '../../utils/sortTimedRoundProps';
import { filterInfRoundProps } from '../../utils/filterInfRoundProps';
import { House, Proposal, Round } from '@prophouse/sdk-react';

export interface PropHouseSlice {
  onchainActiveProposal?: Proposal;
  onchainActiveProposals?: Proposal[];
  onchainActiveRound?: Round;
  onchainActiveHouse?: House;

  activeRound?: StoredAuctionBase;
  activeProposals?: StoredProposalWithVotes[];
  activeCommunity?: Community;
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
    setActiveRound: (state, action: PayloadAction<StoredAuctionBase | undefined>) => {
      state.activeRound = action.payload;
    },
    setOnchainActiveRound: (state, action: PayloadAction<Round | undefined>) => {
      state.onchainActiveRound = action.payload;
    },
    setOnchainActiveProposal: (state, action: PayloadAction<Proposal>) => {
      state.onchainActiveProposal = action.payload;
    },
    setActiveProposals: (state, action: PayloadAction<StoredProposalWithVotes[]>) => {
      state.activeProposals = sortTimedRoundProps(action.payload, {
        sortType: TimedRoundSortType.CreatedAt,
        ascending: false,
      });
      state.infRoundFilteredProposals = action.payload;
    },
    setOnChainActiveProposals: (state, action: PayloadAction<Proposal[] | undefined>) => {
      state.onchainActiveProposals =
        action.payload === undefined
          ? undefined
          : action.payload.sort((a, b) => Number(b.votingPower) - Number(a.votingPower));
    },
    appendProposal: (state, action: PayloadAction<{ proposal: StoredProposalWithVotes }>) => {
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
      if (!state.activeProposals) return;

      state.infRoundFilteredProposals = filterInfRoundProps(
        state.activeProposals,
        action.payload.type,
        action.payload.round,
      );
    },
    setInfRoundFilterType: (state, action: PayloadAction<InfRoundFilterType>) => {
      state.infRoundFilterType = action.payload;
    },
    setActiveCommunity: (state, action: PayloadAction<Community | undefined>) => {
      state.activeCommunity = action.payload;
    },
    setOnchainActiveHouse: (state, action: PayloadAction<House | undefined>) => {
      state.onchainActiveHouse = action.payload;
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

  setActiveRound,
  setActiveProposals,
  appendProposal,
  sortTimedRoundProposals,
  filterInfRoundProposals,
  setActiveCommunity,
  setModalActive,
  setInfRoundFilterType,
} = propHouseSlice.actions;

export default propHouseSlice.reducer;
