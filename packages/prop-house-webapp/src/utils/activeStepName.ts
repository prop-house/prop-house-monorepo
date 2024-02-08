export const activeStepName = (activeStep: number) => {
  switch (activeStep) {
    case 1:
      return 'House Selection';
    case 2:
      return 'Round Details';
    case 3:
      return 'Voters';
    case 4:
      return 'Awards';
    case 5:
      return 'Round Timing';
    case 6:
      return 'Review & Create';
    default:
      return 'Unknown step';
  }
};
