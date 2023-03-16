import {
  StoredProposalWithVotes,
  Community,
  StoredAuctionBase,
} from '@nouns/prop-house-wrapper/dist/builders';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import dayjs from 'dayjs';
import { sortByVotesAndHandleTies } from '../../utils/sortByVotesAndHandleTies';

export interface PropHouseSlice {
  activeRound?: StoredAuctionBase;
  activeProposal?: StoredProposalWithVotes;
  activeProposals?: StoredProposalWithVotes[];
  activeCommunity?: Community;
  modalActive: boolean;
}

const initialState: PropHouseSlice = { modalActive: false };

interface TimedRoundSortProps {
  sortType: TimedRoundSortType;
  ascending: boolean;
}

export enum TimedRoundSortType {
  VoteCount,
  CreatedAt,
  Random,
}

const sortHelper = (a: any, b: any, ascending: boolean) => {
  return ascending ? (a < b ? -1 : 1) : a < b ? 1 : -1;
};

const _sortProps = (proposals: StoredProposalWithVotes[], props: TimedRoundSortProps) => {
  switch (props.sortType) {
    case TimedRoundSortType.VoteCount:
      return sortByVotesAndHandleTies(proposals, props.ascending);
    case TimedRoundSortType.Random:
      return proposals.sort(() => Math.random() - 0.5);
    case TimedRoundSortType.CreatedAt:
      return proposals.sort((a, b) =>
        sortHelper(dayjs(a.createdDate), dayjs(b.createdDate), props.ascending),
      );
    default:
      return proposals.sort((a, b) =>
        sortHelper(dayjs(a.createdDate), dayjs(b.createdDate), props.ascending),
      );
  }
};

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
        sortType: TimedRoundSortType.CreatedAt,
        ascending: false,
      });
    },
    appendProposal: (state, action: PayloadAction<{ proposal: StoredProposalWithVotes }>) => {
      state.activeProposals?.push(action.payload.proposal);
    },
    sortTimedRoundProposals: (state, action: PayloadAction<TimedRoundSortProps>) => {
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
  sortTimedRoundProposals,
  setActiveCommunity,
  setModalActive,
} = propHouseSlice.actions;

export default propHouseSlice.reducer;
