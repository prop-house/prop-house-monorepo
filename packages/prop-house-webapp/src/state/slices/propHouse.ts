import { StoredAuction } from '@nouns/prop-house-wrapper/dist/builders'
import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface PropHouseSlice {
	auctions: StoredAuction[],
}

const initialState: PropHouseSlice = {
	auctions: []
}

const containsAuction = (auctions: StoredAuction[], id: number) => auctions.map(auction => auction.id).includes(id)
const sortAuctions = (auctions: StoredAuction[]) => auctions.sort((a, b) => a.id - b.id)
const addAuctionToState = (state: PropHouseSlice, auction: StoredAuction) => {
			if(containsAuction(state.auctions, auction.id)) return state;
			state.auctions.push(auction)
			state.auctions = sortAuctions(state.auctions)
			return state
}
const addAuctionsToState = (state: PropHouseSlice, auctions: StoredAuction[]) => {
	for(let i in auctions) {
		state = addAuctionToState(state, auctions[i])
	}
	return state;
}
const updateAuctionInState = (state:PropHouseSlice, auction: StoredAuction) => {
	if(!containsAuction(state.auctions, auction.id)) return addAuctionToState(state, auction);
	const auctionIds = state.auctions.map(auction => auction.id)
	state.auctions[auctionIds.indexOf(auction.id)] = auction
	return state
}

export const propHouseSlice = createSlice({
  name: 'propHouse',
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
		}
  }
})

// Action creators are generated for each case reducer function
export const { addAuction, addAuctions } = propHouseSlice.actions

export default propHouseSlice.reducer