import { TimeperiodValidation } from '../types/Round';

export const timeperiodValidation = (
  propEntryStart: number,
  propEntryEnd: number,
): TimeperiodValidation => {
  return {
    name: 'timeperiod',
    params: {
      propEntryStart,
      propEntryEnd,
    },
  };
};
