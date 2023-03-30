import { NewRound } from '../../../state/slices/round';
import removeTags from '../../../utils/removeTags';

const isStep1Valid = (round: NewRound) =>
  3 <= round.house.title.length &&
  round.house.title.length <= 255 &&
  20 <= removeTags(round.house.description).length &&
  round.house.image !== '';

const isStep2Valid = (round: NewRound) =>
  5 <= round.title.length &&
  round.title.length <= 255 &&
  20 <= removeTags(round.description).length;

const isStep3Valid = (round: NewRound) => round.strategies.length > 0;

const isStep4Valid = (round: NewRound) =>
  round.awards.length > 0 && round.awards.some(a => a.state === 'success');

const isStep5Valid = (round: NewRound) =>
  round.proposalPeriodStartUnixTimestamp !== 0 &&
  round.proposalPeriodDurationSecs !== 0 &&
  round.votePeriodDurationSecs !== 0;

const isAllStepsValid = (round: NewRound) =>
  isStep1Valid(round) &&
  isStep2Valid(round) &&
  isStep3Valid(round) &&
  isStep4Valid(round) &&
  isStep5Valid(round);

export const isRoundStepValid = (round: NewRound, step: number) => {
  const validators = [
    isStep1Valid,
    isStep2Valid,
    isStep3Valid,
    isStep4Valid,
    isStep5Valid,
    isAllStepsValid,
  ];
  const validator = validators[step - 1];
  return validator ? validator(round) : false;
};
