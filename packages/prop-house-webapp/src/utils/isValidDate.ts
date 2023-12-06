import dayjs, { Dayjs } from 'dayjs';

export const validStartDate = (current: Dayjs) => {
  // need to figure out how to validate by time too
  // 1)
  return dayjs().isBefore(current);

  // 2)
  // // Check if the selected date is in the past
  // const now = dayjs();
  // if (current.isBefore(now, 'day')) {
  //   return false;
  // }

  // // Check if the selected date is today and the selected time is in the past
  // if (current.isSame(now, 'day') && current.isBefore(now)) {
  //   return false;
  // }

  // return true;
  // 3)
  // const now = dayjs();
  // return !current.isBefore(now, 'minute');
};
