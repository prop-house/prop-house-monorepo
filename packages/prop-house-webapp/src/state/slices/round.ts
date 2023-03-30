import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { isRoundStepValid } from '../../components/HouseManager/utils/isRoundStepValid';
import { HouseType, VotingStrategyConfig } from '@prophouse/sdk-react';
import { Award, NewAward } from '../../components/HouseManager/AssetSelector';

export interface HouseProps {
  existingHouse: boolean;
  houseType: HouseType;
  address: string;
  title: string;
  description: string;
  image: string;
  roundCount: number;
  contractURI?: string;
}
export const HouseForRound: HouseProps = {
  existingHouse: true,
  houseType: HouseType.COMMUNITY,
  address: '',
  title: '',
  description: '',
  image: '',
  roundCount: 0,
  contractURI: '',
};

export interface NewRound {
  house: HouseProps;
  title: string;
  startTime: Date | null;
  proposalEndTime: Date | null;
  votingEndTime: Date | null;
  proposalPeriodStartUnixTimestamp: number;
  proposalPeriodDurationSecs: number;
  votePeriodDurationSecs: number;
  numWinners: number;
  currencyType: string;
  description: string;
  strategies: VotingStrategyConfig[];
  timedRound: boolean;
  awards: Award[];
  splitAwards: boolean;
}

export const initialRound: NewRound = {
  house: HouseForRound,
  title: '',
  startTime: null,
  proposalEndTime: null,
  votingEndTime: null,
  proposalPeriodStartUnixTimestamp: 0,
  proposalPeriodDurationSecs: 0,
  votePeriodDurationSecs: 0,
  numWinners: 1,
  currencyType: '',
  description: '',
  strategies: [],
  timedRound: true,
  awards: [NewAward],
  splitAwards: true,
};

interface RoundState {
  activeStep: number;
  round: NewRound;
  stepDisabledArray: boolean[];
}

const initialState: RoundState = {
  activeStep: 1,
  round: initialRound,
  stepDisabledArray: [true, true, true, true, true, true],
};

const removeIncompleteAwards = (round: NewRound) => {
  if (!round.splitAwards) {
    const filteredAwards = round.awards.filter(award => award.state === 'success');
    round.awards = filteredAwards;
    round.numWinners = filteredAwards.length;
  }
};

export const roundSlice = createSlice({
  name: 'round',
  initialState,
  reducers: {
    setActiveStep: (state, action: PayloadAction<number>) => {
      state.activeStep = action.payload;
    },
    checkStepCriteria: state => {
      const { round, activeStep } = state;
      const stepIndex = activeStep - 1;

      state.stepDisabledArray[stepIndex] = !isRoundStepValid(round, activeStep);

      // If the user is on step 1 and they select an existing house, move to step 2
      if (
        activeStep === 1 &&
        round.house.existingHouse &&
        state.stepDisabledArray[stepIndex] === false
      ) {
        state.activeStep = 2;
      }
    },
    setNextStep: state => {
      removeIncompleteAwards(state.round);
      state.activeStep = Math.min(state.activeStep + 1, 6);
    },
    setPrevStep: state => {
      removeIncompleteAwards(state.round);
      state.activeStep = Math.max(state.activeStep - 1, 1);
    },
    updateRound: (state, action: PayloadAction<NewRound>) => {
      state.round = action.payload;
    },
  },
});

export const { setActiveStep, checkStepCriteria, setNextStep, setPrevStep, updateRound } =
  roundSlice.actions;
export default roundSlice.reducer;
