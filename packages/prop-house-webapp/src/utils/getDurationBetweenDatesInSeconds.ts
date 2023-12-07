import { getTimestampFromDate } from './getTimestampFromDate';

/**
 * Calculates the duration between two dates in seconds.
 * @param startDate Start date (Date object)
 * @param endDate End date (Date object)
 * @returns Duration in seconds between the two dates
 *
 * ex. getDurationInSeconds(new Date('2023-04-01T00:00:00.000Z'), new Date('2023-04-08T00:00:00.000Z')) => 604800
 */
export const getDurationBetweenDatesInSeconds = (startDate: Date, endDate: Date): number => {
  const startTimestamp = getTimestampFromDate(startDate);
  const endTimestamp = getTimestampFromDate(endDate);
  return endTimestamp - startTimestamp;
};
