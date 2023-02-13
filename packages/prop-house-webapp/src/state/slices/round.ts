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
    nextStep: state => {
      state.activeStep = Math.min(state.activeStep + 1, 5);
    },
    prevStep: state => {
      state.activeStep = Math.max(state.activeStep - 1, 1);
    },
  },
});

export const { setActiveStep, nextStep, prevStep } = roundSlice.actions;
export default roundSlice.reducer;
