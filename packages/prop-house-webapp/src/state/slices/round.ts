import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface RoundState {
  activeStep: number;
}

const initialState: RoundState = {
  activeStep: 1,
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
