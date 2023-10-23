import { NewRound } from '../../../state/slices/round';
import removeTags from '../../../utils/removeTags';

// HOUSE INFO
// Title: 3-255 characters
// Description: 20+ characters
const isStep1Valid = (round: NewRound) =>
  3 <= round.house.title.length &&
  round.house.title.length <= 255 &&
  20 <= removeTags(round.house.description).length &&
  round.house.image !== '';

// ROUND INFO
// Title: 5-255 characters
// Description: 20+ characters
const isStep2Valid = (round: NewRound) =>
  5 <= round.title.length &&
  round.title.length <= 255 &&
  20 <= removeTags(round.description).length;

// VOTERS
// At least one voter
const isStep3Valid = (round: NewRound) => round.voters.length > 0;

// AWARDS
// At least one valid award
const isStep4Valid = (round: NewRound) =>
  round.awards.length > 0 && round.awards.some(a => a.state === 'success');

// TIMING
// A start time and both period durations must be set
const isStep5Valid = (round: NewRound) =>
  round.proposalPeriodStartUnixTimestamp !== 0 &&
  round.proposalPeriodDurationSecs !== 0 &&
  round.votePeriodDurationSecs !== 0;

// CREATE
// All steps must be valid to create a round
const isAllStepsValid = (round: NewRound) =>
  isStep1Valid(round) &&
  isStep2Valid(round) &&
  isStep3Valid(round) &&
  isStep4Valid(round) &&
  isStep5Valid(round);

// This function is used to determine if a step is valid
export const isRoundStepValid = (round: NewRound, step: number) => {
  const validators = [
    isStep1Valid,
    isStep2Valid,
    isStep3Valid,
    isStep4Valid,
    isStep5Valid,
    isAllStepsValid,
  ];

  // the step is 1-indexed, but the validators array is 0-indexed
  const validator = validators[step - 1];

  return validator(round);
};
