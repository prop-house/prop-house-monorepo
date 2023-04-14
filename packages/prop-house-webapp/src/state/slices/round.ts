import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { isRoundStepValid } from '../../components/HouseManager/utils/isRoundStepValid';
import { HouseType, RoundType, VotingStrategyConfig } from '@prophouse/sdk-react';
import { Award, NewAward } from '../../components/HouseManager/AssetSelector';

export interface HouseProps {
  existingHouse: boolean;
  houseType: HouseType;
  address: string;
  title: string;
  description: string;
  image: string;
  contractURI: string;
}

export const HouseForRound: HouseProps = {
  existingHouse: true,
  houseType: HouseType.COMMUNITY,
  address: '',
  title: '',
  description: '',
  image: '',
  contractURI: '',
};

export interface NewRound {
  house: HouseProps;
  title: string;
  proposalPeriodStartUnixTimestamp: number;
  proposalPeriodDurationSecs: number;
  votePeriodDurationSecs: number;
  numWinners: number;
  currencyType: string;
  description: string;
  strategies: VotingStrategyConfig[];
  awards: Award[];
  splitAwards: boolean;
  roundType: RoundType;
}

export const initialRound: NewRound = {
  house: HouseForRound,
  title: '',
  proposalPeriodStartUnixTimestamp: 0,
  proposalPeriodDurationSecs: 0,
  votePeriodDurationSecs: 0,
  numWinners: 1,
  currencyType: '',
  description: '',
  strategies: [],
  awards: [NewAward],
  splitAwards: true,
  roundType: RoundType.TIMED_FUNDING,
};

interface RoundState {
  activeStep: number;
  round: NewRound;
  stepDisabledArray: boolean[];
}

const initialState: RoundState = {
  activeStep: 1,
  round: initialRound,
  // steps are disabled by default, and are enabled only when the user
  // completes the step criteria (e.g. fills out all required fields)
  stepDisabledArray: [true, true, true, true, true, true],
};

// this function removes any awards that are not completed to
// prevent the user from creating a round with incomplete awards
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
    // This function checks the validity of each step and updates the stepDisabledArray
    checkStepCriteria: state => {
      const { round, activeStep } = state;
      const stepIndex = activeStep - 1;

      //
      state.stepDisabledArray[stepIndex] = !isRoundStepValid(round, activeStep);

      // If the user is on step 1 and they select an existing house,
      // move to step 2 since there is no 'Next' button in the footer
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
