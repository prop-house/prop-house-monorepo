/**
 * Adds a duration in seconds to a date and returns the resulting date.
 * @param date Base date (Date object)
 * @param durationInSeconds Duration in seconds to add to the base date
 * @returns Date object after adding the duration
 *
 * ex. getDateFromDuration(new Date('2023-04-01T00:00:00.000Z'), 604800) => 2023-04-08T00:00:00.000Z
 */
export const getDateFromDuration = (date: Date, durationInSeconds: number): Date =>
  new Date(date.valueOf() + durationInSeconds * 1000);
