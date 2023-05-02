import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration'; // import plugin

/**
 * Take a time duration in seconds and returns a string of hours or days, whichever is the biggest unit
 * @param seconds
 */
export const timestampToDateUnit = (seconds: number) => {
  dayjs.extend(duration);
  const period = dayjs.duration(seconds * 1000);
  const days = Number(period.asDays().toFixed(0));
  const hours = Number(period.asHours().toFixed(0));

  return hours >= 24 ? `${days} day${days > 1 ? 's' : ''}` : `${hours} hours`;
};
