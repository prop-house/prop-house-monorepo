import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AwardProps } from '../../components/HouseManager/SetTheAwards';
import { AddressProps } from '../../components/HouseManager/WhoCanParticipate';

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
    setDisabled: (state, action: PayloadAction<boolean>) => {
      // Update the stepDisabledArray based on the active step
      const { activeStep, round } = state;

      // Validation criteria for each step
      const isStep1Disabled = !(
        5 <= round.title.length &&
        round.title.length <= 255 &&
        20 <= round.description.length
      );
      const isStep2Disabled = !(
        round.votingContracts.some(c => c.state === 'Success' && c.votesPerToken > 0) ||
        round.votingUsers.some(u => u.state === 'Success' && u.votesPerToken > 0)
      );
      const isStep3Disabled = !(
        round.awards.some(c => c.state === 'Success') &&
        round.numWinners !== 0 &&
        round.fundingAmount !== 0
      );
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
