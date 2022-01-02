/**
 * Return the Nth element from a list or null if the list is not long enough
 * @param n Nth item to return from the list
 * @param list list to return from
 * @returns An object of type T or null if the list is shorter than n + 1elements
 */
const nthOrNull = <T>(n: number, list: T[]): T | null => {
  return list.length >= n + 1 ? list[n] : null;
}

export default nthOrNull;
