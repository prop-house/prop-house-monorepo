import dayjs from 'dayjs';

/**
 * Formats dayjs().fromNow() to a shorter version. eg '20 minutes ago' -> '20m'
 */
export const shortFromNow = (timestamp: number) => {
  const weekDiff = dayjs().diff(timestamp, 'week');
  if (weekDiff > 0) return `${weekDiff}w`;

  const dayDiff = dayjs().diff(timestamp, 'day');
  if (dayDiff > 0) return `${dayDiff}d`;

  const hourDiff = dayjs().diff(timestamp, 'hour');
  if (hourDiff > 0) return `${hourDiff}h`;

  const minDiff = dayjs().diff(timestamp, 'minute');
  if (minDiff > 0) return `${minDiff}m`;

  const secDiff = dayjs().diff(timestamp, 'second');
  if (secDiff > 0) return `${secDiff}m`;
};
