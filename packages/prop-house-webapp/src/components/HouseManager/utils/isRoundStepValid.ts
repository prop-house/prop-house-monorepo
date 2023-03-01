import { InitialRoundProps } from '../../../state/slices/round';

export const isRoundStepValid = (round: InitialRoundProps, step: number) => {
  const isStep1Valid =
    5 <= round.title.length && round.title.length <= 255 && 20 <= round.description.length;
  const isStep2Valid =
    round.votingContracts.some(c => c.state === 'Success' && c.votesPerToken > 0) ||
    round.votingUsers.some(u => u.state === 'Success' && u.votesPerToken > 0);
  const isStep3Valid =
    round.awards.some(a => a.state === 'Success' && a.amount !== 0) &&
    round.numWinners !== 0 &&
    round.fundingAmount !== 0;
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
