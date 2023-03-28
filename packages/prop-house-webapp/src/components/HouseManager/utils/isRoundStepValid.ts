import { NewRound } from '../../../state/slices/round';

export const isRoundStepValid = (round: NewRound, step: number) => {
  const isStep1Valid =
    5 <= round.title.length && round.title.length <= 255 && 20 <= round.description.length;
  const isStep2Valid = round.strategies.length > 0;
  const isStep3Valid = round.awards.length > 0 && round.awards.some(a => a.state === 'success');
  const isStep4Valid =
    round.startTime !== null && round.proposalEndTime !== null && round.votingEndTime !== null;
  const isStep5Valid = isStep1Valid && isStep2Valid && isStep3Valid && isStep4Valid;

  switch (step) {
    case 1:
      return isStep1Valid;
    case 2:
      return isStep2Valid;
    case 3:
      return isStep3Valid;
    case 4:
      return isStep4Valid;
    case 5:
      return isStep5Valid;
    default:
      return false; // Invalid step
  }
};