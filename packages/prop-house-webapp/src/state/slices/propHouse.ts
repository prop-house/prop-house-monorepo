import { House, Proposal, Round } from '@prophouse/sdk-react';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { sortByVotesAndHandleTies } from '../../utils/sortByVotesAndHandleTies';
import dayjs from 'dayjs';

export interface PropHouseSlice {
  activeRound?: Round;
  activeProposal?: Proposal;
  activeProposals?: Proposal[];
  activeCommunity?: House;
  modalActive: boolean;
  infRoundFilteredProposals?: Proposal[];
  infRoundFilterType: InfRoundFilterType;
}

interface TimedRoundSortProps {
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
  Stale,
}

const initialState: PropHouseSlice = {
  modalActive: false,
  infRoundFilterType: InfRoundFilterType.Active,
};

const sortHelper = (a: any, b: any, ascending: boolean) => {
  return ascending ? (a < b ? -1 : 1) : a < b ? 1 : -1;
};

const sortTimedRoundProps = (proposals: Proposal[], props: TimedRoundSortProps) => {
  switch (props.sortType) {
    case TimedRoundSortType.VoteCount:
      return sortByVotesAndHandleTies(proposals, props.ascending);
    case TimedRoundSortType.Random:
      return proposals.sort(() => Math.random() - 0.5);
    case TimedRoundSortType.CreatedAt:
      return proposals.sort((a, b) =>
        sortHelper(dayjs.unix(a.receivedAt), dayjs.unix(b.receivedAt), props.ascending),
      );
    default:
      return proposals.sort((a, b) =>
        sortHelper(dayjs.unix(a.receivedAt), dayjs.unix(b.receivedAt), props.ascending),
      );
  }
};

const filterInfRoundProps = (
  props: Proposal[],
  type: InfRoundFilterType,
  round: Round,
) => {
  const now = dayjs();
  // TODO: Not implemented yet
  // switch (type) {
  //   case InfRoundFilterType.Active:
  //     return props.filter(
  //       p =>
  //         BigInt(p.votingPower) < BigInt(round.quorum) &&
  //         dayjs(p.receivedAt).isAfter(now.subtract(round.votingPeriod, 's')),
  //     );
  //   case InfRoundFilterType.Winners:
  //     return props.filter(p => BigInt(p.votingPower) >= BigInt(round.quorum));
  //   case InfRoundFilterType.Stale:
  //     return props.filter(
  //       p =>
  //         BigInt(p.votingPower) < BigInt(round.quorum) &&
  //         dayjs(p.receivedAt).isBefore(now.subtract(round.votingPeriod, 's')),
  //     );
  //   default:
  //     return props;
  // }
  return props;
};

export const propHouseSlice = createSlice({
  name: 'propHouse',
  initialState,
  reducers: {
    setActiveRound: (state, action: PayloadAction<Round | undefined>) => {
      state.activeRound = action.payload;
    },
    setActiveProposal: (state, action: PayloadAction<Proposal | undefined>) => {
      state.activeProposal = action.payload;
    },
    setActiveProposals: (state, action: PayloadAction<Proposal[]>) => {
      state.activeProposals = sortTimedRoundProps(action.payload, {
        sortType: TimedRoundSortType.CreatedAt,
        ascending: false,
      });
      state.infRoundFilteredProposals = action.payload;
    },
    appendProposal: (state, action: PayloadAction<{ proposal: Proposal }>) => {
      state.activeProposals?.push(action.payload.proposal);
    },
    sortTimedRoundProposals: (state, action: PayloadAction<TimedRoundSortProps>) => {
      if (!state.activeProposals) return;
      state.activeProposals = sortTimedRoundProps(state.activeProposals, action.payload);
    },
    filterInfRoundProposals: (
      state,
      action: PayloadAction<{ type: InfRoundFilterType; round: Round }>,
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
    // TODO: Improve this query + type
    setActiveCommunity: (state, action: PayloadAction<House | undefined>) => {
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
  filterInfRoundProposals,
  setActiveCommunity,
  setModalActive,
  setInfRoundFilterType,
} = propHouseSlice.actions;

export default propHouseSlice.reducer;
