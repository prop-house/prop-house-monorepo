/**
 * Converts a Unix timestamp to a Date object.
 * @param unixTimestamp Unix timestamp (number)
 * @returns Date object corresponding to the Unix timestamp
 *
 * ex. getDateFromTimestamp(1661990400) => 2023-04-01T00:00:00.000Z
 */
export const getDateFromTimestamp = (unixTimestamp: number): Date => new Date(unixTimestamp * 1000);
