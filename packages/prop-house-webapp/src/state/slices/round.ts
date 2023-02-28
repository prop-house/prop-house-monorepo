import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { isRoundStepValid } from '../../components/HouseManager/utils/isRoundStepValid';
import { AwardProps } from '../../components/HouseManager/AwardsSelector';
import { AddressProps } from '../../components/HouseManager/VotingStrategies';

export interface InitialRoundProps {
  title: string;
  startTime: Date | null;
  proposalEndTime: Date | null;
  votingEndTime: Date | null;
  fundingAmount: number;
  numWinners: number;
  currencyType: string;
  description: string;
  votingContracts: AddressProps[];
  votingUsers: AddressProps[];
  awards: AwardProps[];
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
  votingContracts: [],
  votingUsers: [],
  awards: [],
};

interface RoundState {
  activeStep: number;
  round: InitialRoundProps;
  stepDisabledArray: boolean[];
}

const initialState: RoundState = {
  activeStep: 1,
  round: initialRound,
  stepDisabledArray: [true, true, true, true, true],
};

export const roundSlice = createSlice({
  name: 'round',
  initialState,
  reducers: {
    setActiveStep: (state, action: PayloadAction<number>) => {
      state.activeStep = action.payload;
    },
    checkStepCriteria: state => {
      const { round } = state;
      // Call isRoundStepValid to calculate the disabled state for the current step (i + 1).
      // If the step is not valid (isRoundStepValid returns false), set the disabled state to true by negating the result.
      state.stepDisabledArray = Array.from(
        { length: 5 },
        (_, i) => !isRoundStepValid(round, i + 1),
      );
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

export const { setActiveStep, checkStepCriteria, setNextStep, setPrevStep, updateRound } =
  roundSlice.actions;
export default roundSlice.reducer;