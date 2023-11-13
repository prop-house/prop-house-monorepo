/**
 * Converts a number of seconds to days.
 * @param seconds Number of seconds
 * @returns Number of days corresponding to the given number of seconds
 *
 * ex. getSecondsFromDays(604800) => 7
 */
export const getDaysFromSeconds = (seconds: number): number => seconds / (24 * 60 * 60);
