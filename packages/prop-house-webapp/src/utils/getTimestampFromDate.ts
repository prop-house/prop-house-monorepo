/**
 * Converts a Date object to a Unix timestamp.
 * @param date Date object
 * @returns Unix timestamp (number) corresponding to the Date object
 *
 * ex. getTimestampFromDate(new Date('2023-04-01T00:00:00.000Z')) => 1661990400
 */
export const getTimestampFromDate = (date: Date): number => Math.floor(date.valueOf() / 1000);
