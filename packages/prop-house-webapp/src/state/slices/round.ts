import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface InitialRoundProps {
  title: string;
  startTime: Date | null;
  proposalEndTime: Date | null;
  votingEndTime: Date | null;
  fundingAmount: number;
  numWinners: number;
  currencyType: string;
  description: string;
}

interface RoundState {
  activeStep: number;
  round: InitialRoundProps;
}

const initialRound: InitialRoundProps = {
  title: '',
  startTime: null,
  proposalEndTime: null,
  votingEndTime: null,
  fundingAmount: 0,
  numWinners: 0,
  currencyType: '',
  description: '',
};

const initialState: RoundState = {
  activeStep: 1,
  round: initialRound,
};

export const roundSlice = createSlice({
  name: 'round',
  initialState,
  reducers: {
    setActiveStep: (state, action: PayloadAction<number>) => {
      state.activeStep = action.payload;
    },
    setNextStep: state => {
      state.activeStep = Math.min(state.activeStep + 1, 5);
    },
    setPrevStep: state => {
      state.activeStep = Math.max(state.activeStep - 1, 1);
    },
    updateRound: (state, action: PayloadAction<InitialRoundProps>) => {
      state.round = action.payload;
    },
  },
});

export const { setActiveStep, setNextStep, setPrevStep, updateRound } = roundSlice.actions;
export default roundSlice.reducer;
