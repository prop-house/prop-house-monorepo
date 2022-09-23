import {
  StoredAuction,
  StoredProposalWithVotes,
  CommunityWithAuctions,
} from '@nouns/prop-house-wrapper/dist/builders';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { SortProps, SortType, _sortProps } from '../../utils/sortingProposals';

export interface PropHouseSlice {
  activeRound?: StoredAuction;
  activeProposal?: StoredProposalWithVotes;
  activeProposals?: StoredProposalWithVotes[];
  delegatedVotes?: number;
  activeCommunity?: CommunityWithAuctions;
}

const initialState: PropHouseSlice = {};

export const propHouseSlice = createSlice({
  name: 'propHouse',
  initialState,
  reducers: {
    setActiveRound: (state, action: PayloadAction<StoredAuction | undefined>) => {
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
    setDelegatedVotes: (state, action: PayloadAction<number | undefined>) => {
      state.delegatedVotes = action.payload;
    },
    sortProposals: (state, action: PayloadAction<SortProps>) => {
      if (!state.activeProposals) return;
      state.activeProposals = _sortProps(state.activeProposals, action.payload);
    },
    setActiveCommunity: (state, action: PayloadAction<CommunityWithAuctions | undefined>) => {
      state.activeCommunity = action.payload;
    },
  },
});

// Action creators are generated for each case reducer function
export const {
  setActiveRound,
  setActiveProposal,
  setActiveProposals,
  appendProposal,
  setDelegatedVotes,
  sortProposals,
  setActiveCommunity,
} = propHouseSlice.actions;

export default propHouseSlice.reducer;
