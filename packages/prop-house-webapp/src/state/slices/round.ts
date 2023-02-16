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

interface RoundState {
  activeStep: number;
  round: InitialRoundProps;
  stepDisabledArray: boolean[];
}

const initialState: RoundState = {
  activeStep: 1,
  round: initialRound,
  stepDisabledArray: [true, false, true, true, true],
};

export const roundSlice = createSlice({
  name: 'round',
  initialState,
  reducers: {
    setActiveStep: (state, action: PayloadAction<number>) => {
      state.activeStep = action.payload;
    },
    setDisabled: (state, action: PayloadAction<boolean>) => {
      // Update the stepDisabledArray based on the active step
      const { activeStep, round } = state;

      // Validation criteria for each step
      const isStep1Disabled = !(round.title !== '' && round.description !== '');
      const isStep2Disabled = false;
      const isStep3Disabled = !(round.numWinners !== 0 && round.fundingAmount !== 0);
      const isStep4Disabled = !(
        round.startTime !== null &&
        round.proposalEndTime !== null &&
        round.votingEndTime !== null
      );
      const isStep5Disabled = false;

      if (activeStep === 1) state.stepDisabledArray[0] = isStep1Disabled;
      if (activeStep === 2) state.stepDisabledArray[1] = isStep2Disabled;
      if (activeStep === 3) state.stepDisabledArray[2] = isStep3Disabled;
      if (activeStep === 4) state.stepDisabledArray[3] = isStep4Disabled;
      if (activeStep === 5) state.stepDisabledArray[4] = isStep5Disabled;
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

export const { setActiveStep, setDisabled, setNextStep, setPrevStep, updateRound } =
  roundSlice.actions;
export default roundSlice.reducer;
