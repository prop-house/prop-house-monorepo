import {
  StoredAuction,
  StoredProposalWithVotes,
} from "@nouns/prop-house-wrapper/dist/builders";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface PropHouseSlice {
  auctions: StoredAuction[];
  activeProposal?: StoredProposalWithVotes;
  websocketConnected: boolean;
}

export interface ProposalScoreUpdate {
  id: number;
  score: number;
  auctionId: number;
}

export interface WrappedEvent<T> {
  t: number;
  payload: T;
}

const initialState: PropHouseSlice = {
  auctions: [],
  websocketConnected: false,
};

const containsAuction = (auctions: StoredAuction[], id: number) =>
  auctions.map((auction) => auction.id).includes(id);
const sortAuctions = (auctions: StoredAuction[]) =>
  auctions.sort((a, b) => a.id - b.id);
const addAuctionToState = (state: PropHouseSlice, auction: StoredAuction) => {
  if (containsAuction(state.auctions, auction.id)) return state;
  state.auctions.push(auction);
  state.auctions = sortAuctions(state.auctions);
  return state;
};
const addAuctionsToState = (
  state: PropHouseSlice,
  auctions: StoredAuction[]
) => {
  for (let i in auctions) {
    state = addAuctionToState(state, auctions[i]);
  }
  return state;
};
const updateAuctionInState = (
  state: PropHouseSlice,
  auction: StoredAuction
) => {
  if (!containsAuction(state.auctions, auction.id))
    return addAuctionToState(state, auction);
  const auctionIds = state.auctions.map((auction) => auction.id);
  state.auctions[auctionIds.indexOf(auction.id)] = auction;
  return state;
};
const updateProposalScoreInState = (
  state: PropHouseSlice,
  action: WrappedEvent<ProposalScoreUpdate>
) => {
  state.auctions = state.auctions.map((auction) => {
    auction.proposals = auction.proposals.map((proposal) => {
      if (proposal.id === action.payload.id)
        proposal.score = action.payload.score;
      return proposal;
    });
    return auction;
  });
  return state;
};
const updateProposalScoreInActiveProposal = (
  state: PropHouseSlice,
  action: WrappedEvent<ProposalScoreUpdate>
) => {
  if (
    state.activeProposal === undefined ||
    state.activeProposal.id !== action.payload.id
  )
    return state;
  state.activeProposal.score = action.payload.score;
  return state;
};

export const propHouseSlice = createSlice({
  name: "propHouse",
  initialState,
  reducers: {
    addAuction: (state, action: PayloadAction<StoredAuction>) => {
      state = addAuctionToState(state, action.payload);
    },
    addAuctions: (state, action: PayloadAction<StoredAuction[]>) => {
      state = addAuctionsToState(state, action.payload);
    },
    updateAuction: (state, action: PayloadAction<StoredAuction>) => {
      state = updateAuctionInState(state, action.payload);
    },
    setActiveProposal: (
      state,
      action: PayloadAction<StoredProposalWithVotes>
    ) => {
      state.activeProposal = action.payload;
    },
    updateProposalScore: (
      state,
      action: PayloadAction<WrappedEvent<ProposalScoreUpdate>>
    ) => {
      state = updateProposalScoreInActiveProposal(state, action.payload);
      state = updateProposalScoreInState(state, action.payload);
    },
    updateWebsocketConnected: (state, action: PayloadAction<boolean>) => {
      state.websocketConnected = action.payload;
    },
  },
});

// Action creators are generated for each case reducer function
export const {
  addAuction,
  addAuctions,
  setActiveProposal,
  updateProposalScore,
  updateWebsocketConnected,
} = propHouseSlice.actions;

export default propHouseSlice.reducer;
