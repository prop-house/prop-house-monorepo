import dayjs from 'dayjs';

/**
 * Returns a short string representing the time difference between the now and the given timestamp.
 */
export const timeFromNow = (timestamp: number) => {
  const diff = dayjs(timestamp).diff(dayjs(), 'week');

  const weekDiff = Math.abs(dayjs(timestamp).diff(dayjs(), 'week'));
  if (weekDiff > 0) return `${weekDiff}w`;

  const dayDiff = Math.abs(dayjs(timestamp).diff(dayjs(), 'day'));
  if (dayDiff > 0) return `${dayDiff}d`;

  const hourDiff = Math.abs(dayjs(timestamp).diff(dayjs(), 'hour'));
  if (hourDiff > 0) return `${hourDiff}h`;

  const minDiff = Math.abs(dayjs(timestamp).diff(dayjs(), 'minute'));
  if (minDiff > 0) return `${minDiff}m`;

  const secDiff = Math.abs(dayjs(timestamp).diff(dayjs(), 'second'));
  if (secDiff > 0) return `${secDiff}m`;
};
