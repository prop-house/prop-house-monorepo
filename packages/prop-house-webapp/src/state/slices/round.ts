import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { isRoundStepValid } from '../../components/HouseManager/utils/isRoundStepValid';
import { HouseType, VotingStrategyConfig } from '@prophouse/sdk';
import { Award, NewAward } from '../../components/HouseManager/AssetSelector';

export interface HouseProps {
  houseType: HouseType;
  address: string;
  name: string;
  description: string;
  image: string;
  roundCount: number;
  proposalCount: number;
  contractURI?: string;
}
export const HouseForRound: HouseProps = {
  houseType: HouseType.COMMUNITY,
  address: '',
  name: '',
  description: '',
  image: '',
  roundCount: 0,
  proposalCount: 0,
  contractURI: 'string',
};

export interface NewRound {
  house: HouseProps;
  title: string;
  startTime: Date | null;
  proposalEndTime: Date | null;
  votingEndTime: Date | null;
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
  stepDisabledArray: [true, true, true, true, true],
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
      const { round } = state;

      // Call isRoundStepValid to calculate the disabled state for the current step (i + 1).
      // If the step is not valid (isRoundStepValid returns false), set the disabled state to true by negating the result.
      state.stepDisabledArray = Array.from(
        { length: 5 },
        (_, i) => !isRoundStepValid(round, i + 1),
      );
    },
    setNextStep: state => {
      removeIncompleteAwards(state.round);
      state.activeStep = Math.min(state.activeStep + 1, 5);
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
