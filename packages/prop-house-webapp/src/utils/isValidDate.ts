import dayjs from 'dayjs';

export const validStartDate = (current: dayjs.Dayjs) => {
  // need to figure out how to validate by time too
  return dayjs().isBefore(current) === true;
};

export const validEndDate = (startDate: Date) => (current: dayjs.Dayjs) => {
  const start = dayjs(startDate);

  return (
    dayjs().isBefore(current) === false &&
    start.isBefore(current) === true &&
    start.diff(current, 'day') >= 1
  );
};
