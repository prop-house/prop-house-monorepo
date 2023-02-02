import {
  StoredProposalWithVotes,
  Community,
  StoredAuctionBase,
} from '@nouns/prop-house-wrapper/dist/builders';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { SortProps, SortType, _sortProps } from '../../utils/sortingProposals';

export interface PropHouseSlice {
  activeRound?: StoredAuctionBase;
  activeProposal?: StoredProposalWithVotes;
  activeProposals?: StoredProposalWithVotes[];
  activeCommunity?: Community;
  modalActive: boolean;
}

const initialState: PropHouseSlice = { modalActive: false };

export const propHouseSlice = createSlice({
  name: 'propHouse',
  initialState,
  reducers: {
    setActiveRound: (state, action: PayloadAction<StoredAuctionBase | undefined>) => {
      state.activeRound = action.payload;
    },
    setActiveProposal: (state, action: PayloadAction<StoredProposalWithVotes>) => {
      state.activeProposal = action.payload;
    },
    setActiveProposals: (state, action: PayloadAction<StoredProposalWithVotes[]>) => {
      state.activeProposals = _sortProps(action.payload, {
        sortType: SortType.CreatedAt,
        ascending: false,
      });
    },
    appendProposal: (state, action: PayloadAction<{ proposal: StoredProposalWithVotes }>) => {
      state.activeProposals?.push(action.payload.proposal);
    },
    sortProposals: (state, action: PayloadAction<SortProps>) => {
      if (!state.activeProposals) return;
      state.activeProposals = _sortProps(state.activeProposals, action.payload);
    },
    setActiveCommunity: (state, action: PayloadAction<Community | undefined>) => {
      state.activeCommunity = action.payload;
    },
    setModalActive: (state, action: PayloadAction<boolean>) => {
      state.modalActive = action.payload;
    },
  },
});

// Action creators are generated for each case reducer function
export const {
  setActiveRound,
  setActiveProposal,
  setActiveProposals,
  appendProposal,
  sortProposals,
  setActiveCommunity,
  setModalActive,
} = propHouseSlice.actions;

export default propHouseSlice.reducer;
