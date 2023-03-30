/**
 * Converts a number of days to seconds.
 * @param days Number of days
 * @returns Number of seconds corresponding to the given number of days
 *
 * ex. getSecondsFromDays(7) => 604800
 */
export const getSecondsFromDays = (days: number): number => days * 24 * 60 * 60;
