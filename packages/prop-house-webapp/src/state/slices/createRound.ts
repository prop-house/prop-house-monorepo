import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface CreateRoundState {
  activeStep: number;
}

const initialState: CreateRoundState = {
  activeStep: 1,
};

export const createRoundSlice = createSlice({
  name: 'createRound',
  initialState,
  reducers: {
    setActiveStep: (state, action: PayloadAction<number>) => {
      state.activeStep = action.payload;
    },
    nextStep: state => {
      state.activeStep = Math.min(state.activeStep + 1, 5);
    },
    prevStep: state => {
      state.activeStep = Math.max(state.activeStep - 1, 1);
    },
  },
});

export const { setActiveStep, nextStep, prevStep } = createRoundSlice.actions;
export default createRoundSlice.reducer;
